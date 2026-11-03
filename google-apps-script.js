/**
 * Google Apps Script for the Media Time Perception Prototype.
 *
 * Paste this file into the Apps Script project that is bound to the study's Google Sheet
 * (Extensions > Apps Script). Full setup: docs/google-sheets-setup.md
 *
 * What it does
 * - doPost: validates one completed session (3 rows, one per condition) and appends it to
 *   the "Responses" tab. Writes happen under a script lock, so concurrent participants
 *   cannot overwrite each other, and a session that was already stored (same SubmissionID)
 *   is not appended again, so browser retries are safe.
 * - doGet: health check only. It never returns research data.
 * - onOpen: adds a "Media Time Perception" menu to the Sheet with "Download dataset (CSV)".
 *   The menu runs as the signed-in Google user, so only people the Sheet is shared with
 *   can export the cumulative dataset.
 *
 * Security model (read before deploying)
 * - Deploy as "Execute as: Me" and "Who has access: Anyone". Participants are anonymous,
 *   so the endpoint cannot authenticate them. Anyone who knows the URL can submit rows
 *   that pass validation; nobody can read data through the endpoint.
 * - Access to the collected data is controlled only by the Sheet's sharing settings.
 *
 * Keep COLUMNS in sync with DATASET_COLUMNS in src/lib/dataset.ts.
 */

var SHEET_NAME = 'Responses';
var SCHEMA_VERSION = 2;
var MAX_PAYLOAD_CHARS = 50000;
var LOCK_TIMEOUT_MS = 30000;
var CONDITIONS = ['video', 'audio', 'text'];
var CONDITION_CODES = { video: 'V', audio: 'A', text: 'T' };
var FREQUENCIES = ['very_rarely', 'rarely', 'sometimes', 'often', 'very_often'];
var CAFFEINE_TIMES = ['less_than_1_hour', '1_to_3_hours', 'more_than_3_hours'];
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

/**
 * [column, rule, required]. Rules: see checkValue().
 * Columns marked text are stored as plain text so Sheets does not turn IDs or ISO
 * timestamps into numbers/dates (which also broke the original duplicate check).
 */
var COLUMN_SPECS = [
  ['SubmissionID', 'uuid', true],
  ['ParticipantID', 'id', true],
  ['ConsentDate', 'iso', true],
  ['ParticipantNumber', 'positiveInt', true],
  ['LatinSquareOrder', 'order', true],
  ['ConditionOrder', 'conditionOrder', true],
  ['Language', 'language', true],
  ['Age', 'age', true],
  ['ShortVideosFrequency', 'frequency', true],
  ['AudioFrequency', 'frequency', true],
  ['TextFrequency', 'frequency', true],
  ['CaffeineConsumed', 'yesNo', true],
  ['CaffeineTimeAgo', 'caffeineTime', false],
  ['AlertnessLevel', 'likert', true],
  ['Condition', 'condition', true],
  ['ConditionPosition', 'position', true],
  ['RealDurationSeconds', 'nonNegativeInt', true],
  ['EstimatedDurationSeconds', 'positiveInt', true],
  ['TemporalBiasSeconds', 'int', true],
  ['TemporalBiasPercent', 'number', false],
  ['ConfidenceRating', 'likert', true],
  ['Immersion_Absorbed', 'likert', true],
  ['Immersion_Focused', 'likert', true],
  ['Immersion_LostAwareness', 'likert', true],
  ['Immersion_UnawareSurroundings', 'likert', true],
  ['Immersion_LostTrackTime', 'likert', true],
  ['Immersion_Mean', 'mean', true],
  ['Engagement_Engaging', 'likert', true],
  ['Engagement_MentallyInvolved', 'likert', true],
  ['Engagement_HeldAttention', 'likert', true],
  ['Engagement_Interested', 'likert', true],
  ['Engagement_Motivated', 'likert', true],
  ['Engagement_Mean', 'mean', true],
  ['OverallEngagement', 'mean', true],
  ['Familiarity', 'likert', true],
  ['Timestamp', 'iso', true],
  ['Date', 'date', true],
  ['Time', 'time', true],
  ['ReceivedAt', 'server', false],
];

var TEXT_COLUMNS = ['SubmissionID', 'ParticipantID', 'ConsentDate', 'ConditionOrder', 'Language', 'Timestamp', 'Date', 'Time', 'ReceivedAt'];

/** Fields that describe the participant/session and must be identical on all three rows. */
var SESSION_COLUMNS = [
  'SubmissionID', 'ParticipantID', 'ConsentDate', 'ParticipantNumber', 'LatinSquareOrder', 'ConditionOrder',
  'Language', 'Age', 'ShortVideosFrequency', 'AudioFrequency', 'TextFrequency', 'CaffeineConsumed',
  'CaffeineTimeAgo', 'AlertnessLevel',
];

function getColumns() {
  return COLUMN_SPECS.map(function (spec) { return spec[0]; });
}

// ---------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------

function doPost(e) {
  var contents = e && e.postData ? e.postData.contents : '';
  if (!contents) return jsonResponse({ ok: false, status: 'invalid', error: 'Empty request body.' });
  if (contents.length > MAX_PAYLOAD_CHARS) return jsonResponse({ ok: false, status: 'invalid', error: 'Request body too large.' });

  var payload;
  try {
    payload = JSON.parse(contents);
  } catch (parseError) {
    return jsonResponse({ ok: false, status: 'invalid', error: 'Request body is not valid JSON.' });
  }

  var errors = validateSubmission(payload);
  if (errors.length) {
    return jsonResponse({ ok: false, status: 'invalid', error: errors.slice(0, 10).join(' ') });
  }

  try {
    var result = storeSubmission(payload, SpreadsheetApp.getActiveSpreadsheet());
    return jsonResponse(result);
  } catch (error) {
    // Never echo the payload back; the execution log is only visible to the script owner.
    Logger.log('storeSubmission failed: ' + error);
    return jsonResponse({ ok: false, status: 'error', error: 'The submission could not be stored.' });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'media-time-perception', schemaVersion: SCHEMA_VERSION });
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

function checkValue(rule, value) {
  switch (rule) {
    case 'uuid': return typeof value === 'string' && UUID_PATTERN.test(value);
    case 'id': return typeof value === 'string' && value.length > 0 && value.length <= 64 && /^[A-Za-z0-9_-]+$/.test(value);
    case 'iso': return typeof value === 'string' && ISO_PATTERN.test(value) && !isNaN(new Date(value).getTime());
    case 'date': return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
    case 'time': return typeof value === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(value);
    case 'int': return isInteger(value);
    case 'positiveInt': return isInteger(value) && value >= 1;
    case 'nonNegativeInt': return isInteger(value) && value >= 0;
    case 'number': return typeof value === 'number' && isFinite(value);
    case 'order': return isInteger(value) && value >= 1 && value <= 6;
    case 'position': return isInteger(value) && value >= 1 && value <= 3;
    case 'likert': return isInteger(value) && value >= 1 && value <= 5;
    case 'mean': return typeof value === 'number' && value >= 1 && value <= 5;
    case 'age': return typeof value === 'number' && value > 0 && value <= 120;
    case 'conditionOrder': return typeof value === 'string' && /^[VAT]-[VAT]-[VAT]$/.test(value);
    case 'language': return value === 'en' || value === 'de';
    case 'frequency': return FREQUENCIES.indexOf(value) !== -1;
    case 'yesNo': return value === 'Yes' || value === 'No';
    case 'caffeineTime': return CAFFEINE_TIMES.indexOf(value) !== -1;
    case 'condition': return CONDITIONS.indexOf(value) !== -1;
    default: return false;
  }
}

function isMissing(value) {
  return value === null || value === undefined || value === '';
}

function closeTo(a, b) {
  return Math.abs(a - b) < 0.011;
}

/** Returns a list of human-readable problems; an empty list means the submission is valid. */
function validateSubmission(payload) {
  var errors = [];
  if (!payload || typeof payload !== 'object') return ['Payload must be a JSON object.'];
  if (payload.schemaVersion !== SCHEMA_VERSION) errors.push('Unsupported schemaVersion (expected ' + SCHEMA_VERSION + ').');
  if (!checkValue('uuid', payload.submissionId)) errors.push('submissionId must be a UUID.');
  var rows = payload.rows;
  if (!Array.isArray(rows) || rows.length !== CONDITIONS.length) {
    errors.push('rows must contain exactly ' + CONDITIONS.length + ' entries (one per condition).');
    return errors;
  }

  rows.forEach(function (row, index) {
    var label = 'Row ' + (index + 1) + ': ';
    if (!row || typeof row !== 'object') {
      errors.push(label + 'must be an object.');
      return;
    }
    COLUMN_SPECS.forEach(function (spec) {
      var column = spec[0];
      var rule = spec[1];
      var required = spec[2];
      if (rule === 'server') return;
      var value = row[column];
      if (isMissing(value)) {
        if (required) errors.push(label + column + ' is required.');
      } else if (!checkValue(rule, value)) {
        errors.push(label + column + ' has an invalid value.');
      }
    });
    if (errors.length) return;

    if (row.SubmissionID !== payload.submissionId) errors.push(label + 'SubmissionID does not match submissionId.');
    if (row.TemporalBiasSeconds !== row.EstimatedDurationSeconds - row.RealDurationSeconds) {
      errors.push(label + 'TemporalBiasSeconds must equal EstimatedDurationSeconds - RealDurationSeconds.');
    }
    if (row.RealDurationSeconds === 0 && !isMissing(row.TemporalBiasPercent)) {
      errors.push(label + 'TemporalBiasPercent must be empty when RealDurationSeconds is 0.');
    }
    if (row.RealDurationSeconds > 0 && isMissing(row.TemporalBiasPercent)) {
      errors.push(label + 'TemporalBiasPercent is required when RealDurationSeconds is above 0.');
    }
    if (row.CaffeineConsumed === 'Yes' && isMissing(row.CaffeineTimeAgo)) errors.push(label + 'CaffeineTimeAgo is required when CaffeineConsumed is Yes.');
    if (row.CaffeineConsumed === 'No' && !isMissing(row.CaffeineTimeAgo)) errors.push(label + 'CaffeineTimeAgo must be empty when CaffeineConsumed is No.');
    var immersion = (row.Immersion_Absorbed + row.Immersion_Focused + row.Immersion_LostAwareness + row.Immersion_UnawareSurroundings + row.Immersion_LostTrackTime) / 5;
    var engagement = (row.Engagement_Engaging + row.Engagement_MentallyInvolved + row.Engagement_HeldAttention + row.Engagement_Interested + row.Engagement_Motivated) / 5;
    if (!closeTo(immersion, row.Immersion_Mean)) errors.push(label + 'Immersion_Mean does not match its items.');
    if (!closeTo(engagement, row.Engagement_Mean)) errors.push(label + 'Engagement_Mean does not match its items.');
    if (!closeTo((immersion + engagement) / 2, row.OverallEngagement)) errors.push(label + 'OverallEngagement does not match its items.');
    if (row.Timestamp.slice(0, 10) !== row.Date || row.Timestamp.slice(11, 19) !== row.Time) errors.push(label + 'Date/Time do not match Timestamp.');
  });
  if (errors.length) return errors;

  // Cross-row rules: one row per condition, positions 1..3 matching ConditionOrder, shared session fields.
  var seenConditions = {};
  var expectedOrder = rows[0].ConditionOrder.split('-');
  rows.forEach(function (row) {
    seenConditions[row.Condition] = true;
    if (expectedOrder[row.ConditionPosition - 1] !== CONDITION_CODES[row.Condition]) {
      errors.push('Condition ' + row.Condition + ' is not at position ' + row.ConditionPosition + ' of ConditionOrder.');
    }
    SESSION_COLUMNS.forEach(function (column) {
      var a = isMissing(row[column]) ? null : row[column];
      var b = isMissing(rows[0][column]) ? null : rows[0][column];
      if (a !== b) errors.push(column + ' differs between rows.');
    });
  });
  if (Object.keys(seenConditions).length !== CONDITIONS.length) errors.push('Each condition (video, audio, text) must appear exactly once.');
  return errors;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function getResponsesSheet(spreadsheet) {
  var columns = getColumns();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    var header = sheet.getRange(1, 1, 1, columns.length);
    header.setValues([columns]);
    header.setFontWeight('bold');
    sheet.setFrozenRows(1);
    return sheet;
  }
  var existing = sheet.getRange(1, 1, 1, columns.length).getDisplayValues()[0];
  for (var i = 0; i < columns.length; i++) {
    if (existing[i] !== columns[i]) {
      throw new Error('Header of sheet "' + SHEET_NAME + '" does not match the expected schema at column ' + (i + 1) + '.');
    }
  }
  return sheet;
}

function submissionExists(sheet, submissionId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === submissionId) return true;
  }
  return false;
}

/** Appends a validated submission. Must only be called with a payload that passed validateSubmission. */
function storeSubmission(payload, spreadsheet) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
    return { ok: false, status: 'busy', error: 'The dataset is busy. Please try again.' };
  }
  try {
    var sheet = getResponsesSheet(spreadsheet);
    if (submissionExists(sheet, payload.submissionId)) {
      return { ok: true, status: 'duplicate', submissionId: payload.submissionId, rowsAdded: 0 };
    }

    var columns = getColumns();
    var receivedAt = new Date().toISOString();
    var values = payload.rows.map(function (row) {
      return columns.map(function (column) {
        if (column === 'ReceivedAt') return receivedAt;
        // Keep 0 as 0: the original script used `value || ''`, which erased zero durations.
        return isMissing(row[column]) ? '' : row[column];
      });
    });
    var firstRow = sheet.getLastRow() + 1;
    var neededRows = firstRow + values.length - 1;
    if (neededRows > sheet.getMaxRows()) {
      sheet.insertRowsAfter(sheet.getMaxRows(), neededRows - sheet.getMaxRows());
    }
    TEXT_COLUMNS.forEach(function (column) {
      sheet.getRange(firstRow, columns.indexOf(column) + 1, values.length, 1).setNumberFormat('@');
    });
    sheet.getRange(firstRow, 1, values.length, columns.length).setValues(values);
    SpreadsheetApp.flush();
    return { ok: true, status: 'saved', submissionId: payload.submissionId, rowsAdded: values.length };
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Researcher export (runs inside the Sheet as the signed-in user)
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Media Time Perception')
    .addItem('Download dataset (CSV)', 'showDatasetDownloadDialog')
    .addToUi();
}

function csvEscape(value) {
  var text = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(text) || text !== text.trim()) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

/**
 * Builds the cumulative CSV from the Responses tab. Only complete submissions (one row for
 * each of the three conditions) are exported; anything else is counted and reported.
 */
function buildDatasetExport(spreadsheet) {
  var columns = getColumns();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  var dataRows = [];
  if (sheet && sheet.getLastRow() >= 2) {
    getResponsesSheet(spreadsheet); // throws if the header was edited
    dataRows = sheet.getRange(2, 1, sheet.getLastRow() - 1, columns.length).getDisplayValues();
  }

  var conditionIndex = columns.indexOf('Condition');
  var groups = {};
  var groupOrder = [];
  dataRows.forEach(function (row) {
    var id = row[0];
    if (!groups[id]) {
      groups[id] = [];
      groupOrder.push(id);
    }
    groups[id].push(row);
  });

  var exported = [];
  var excluded = 0;
  groupOrder.forEach(function (id) {
    var rows = groups[id];
    var conditions = {};
    rows.forEach(function (row) { conditions[row[conditionIndex]] = true; });
    var complete = id && rows.length === CONDITIONS.length && CONDITIONS.every(function (c) { return conditions[c]; });
    if (complete) {
      exported = exported.concat(rows);
    } else {
      excluded += 1;
    }
  });

  var lines = [columns.map(csvEscape).join(',')].concat(exported.map(function (row) {
    return row.map(csvEscape).join(',');
  }));
  var today = new Date().toISOString().slice(0, 10);
  return {
    csv: lines.join('\r\n'),
    filename: 'media-time-perception-dataset-' + today + '.csv',
    rowCount: exported.length,
    submissionCount: exported.length / CONDITIONS.length,
    excludedSubmissions: excluded,
  };
}

/** Called from the download dialog via google.script.run. */
function getDatasetExport() {
  return buildDatasetExport(SpreadsheetApp.getActiveSpreadsheet());
}

function showDatasetDownloadDialog() {
  var html =
    '<div style="font-family:sans-serif;font-size:14px" id="msg">Preparing the dataset…</div>' +
    '<script>' +
    'google.script.run' +
    '.withSuccessHandler(function (r) {' +
    '  var msg = document.getElementById("msg");' +
    '  if (!r.rowCount) { msg.textContent = "No complete submissions yet. Nothing to download." +' +
    '    (r.excludedSubmissions ? " Incomplete submissions: " + r.excludedSubmissions + "." : ""); return; }' +
    '  var blob = new Blob(["\\uFEFF" + r.csv], { type: "text/csv;charset=utf-8" });' +
    '  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = r.filename;' +
    '  document.body.appendChild(a); a.click();' +
    '  msg.textContent = "Downloaded " + r.filename + ": " + r.submissionCount + " sessions, " + r.rowCount + " rows." +' +
    '    (r.excludedSubmissions ? " Excluded incomplete submissions: " + r.excludedSubmissions + "." : "");' +
    '})' +
    '.withFailureHandler(function (e) { document.getElementById("msg").textContent = "Export failed: " + e.message; })' +
    '.getDatasetExport();' +
    '</script>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(420).setHeight(140), 'Download dataset');
}

// ---------------------------------------------------------------------------
// Manual check from the Apps Script editor. Validates a synthetic payload without writing to the Sheet.
// ---------------------------------------------------------------------------

function selfTestValidation() {
  var submissionId = Utilities.getUuid();
  var base = {
    SubmissionID: submissionId, ParticipantID: 'SYNTHETIC-001', ConsentDate: '2025-01-01T10:00:00.000Z',
    ParticipantNumber: 1, LatinSquareOrder: 1, ConditionOrder: 'V-A-T', Language: 'en', Age: 30,
    ShortVideosFrequency: 'often', AudioFrequency: 'sometimes', TextFrequency: 'rarely', CaffeineConsumed: 'No',
    CaffeineTimeAgo: null, AlertnessLevel: 3, RealDurationSeconds: 180, EstimatedDurationSeconds: 200,
    TemporalBiasSeconds: 20, TemporalBiasPercent: 11.11, ConfidenceRating: 3, Immersion_Absorbed: 3,
    Immersion_Focused: 3, Immersion_LostAwareness: 3, Immersion_UnawareSurroundings: 3, Immersion_LostTrackTime: 3,
    Immersion_Mean: 3, Engagement_Engaging: 3, Engagement_MentallyInvolved: 3, Engagement_HeldAttention: 3,
    Engagement_Interested: 3, Engagement_Motivated: 3, Engagement_Mean: 3, OverallEngagement: 3, Familiarity: 3,
    Timestamp: '2025-01-01T10:05:00.000Z', Date: '2025-01-01', Time: '10:05:00',
  };
  var rows = CONDITIONS.map(function (condition, index) {
    var row = JSON.parse(JSON.stringify(base));
    row.Condition = condition;
    row.ConditionPosition = index + 1;
    return row;
  });
  Logger.log(JSON.stringify(validateSubmission({ schemaVersion: SCHEMA_VERSION, submissionId: submissionId, rows: rows })));
}
