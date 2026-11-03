> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# Google Sheets Troubleshooting Guide

## المشكلة: البيانات لا تُحفظ في Google Sheets

### الخطوة 1: التحقق من الإعدادات الأساسية

#### ✅ تحقق من Environment Variable

```bash
# في terminal، تحقق من وجود URL
cat .env | grep GOOGLE_SHEETS
```

يجب أن يكون موجوداً:

```
VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/...
```

#### ✅ تحقق من Browser Console

1. افتح Developer Tools (F12)
2. اذهب إلى Console
3. ابحث عن رسائل:
   - `📤 Sending to Google Sheets: ...` (يعني أن الكود يعمل)
   - `✅ Data sent to Google Sheets successfully` (يعني أن الإرسال نجح)
   - `❌ Failed to send data to Google Sheets` (يعني أن هناك خطأ)

### الخطوة 2: التحقق من Google Apps Script

#### 1. تحقق من أن Script منشور بشكل صحيح:

1. افتح Google Sheet: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
2. اذهب إلى **Extensions** → **Apps Script**
3. تحقق من أن الكود موجود
4. اذهب إلى **Deploy** → **Manage deployments**
5. تأكد من أن Deployment موجود و Active

#### 2. تحقق من الصلاحيات:

- **Execute as**: يجب أن يكون "Me"
- **Who has access**: يجب أن يكون "Anyone" (مهم جداً!)

#### 3. تحقق من Execution Logs:

1. في Apps Script، اذهب إلى **Executions** (في القائمة الجانبية)
2. ابحث عن آخر execution
3. إذا كان هناك خطأ، ستجده هنا

### الخطوة 3: اختبار Script يدوياً

#### اختبار doPost function:

1. في Apps Script، أنشئ function اختبار:

```javascript
function testDoPost() {
  const testData = {
    data: [
      {
        participantId: "TEST001",
        participantName: "Test User",
        condition: "video",
        realDurationSec: 180,
        estimatedTimeSec: 200,
        // ... add other required fields
      },
    ],
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

2. شغّل `testDoPost`
3. تحقق من Google Sheet - يجب أن تظهر بيانات الاختبار

### الخطوة 4: مشاكل شائعة وحلولها

#### المشكلة 1: "Google Sheets not configured"

**الحل**: تأكد من أن `VITE_GOOGLE_SHEETS_WEB_APP_URL` موجود في ملف `.env`

#### المشكلة 2: CORS Errors

**الحل**: الكود يستخدم `no-cors` لذلك لن ترى CORS errors. المشكلة قد تكون في:

- URL غير صحيح
- Script غير منشور
- الصلاحيات غير صحيحة

#### المشكلة 3: البيانات تصل لكن لا تُحفظ

**الحل**:

1. تحقق من Execution Logs في Apps Script
2. تأكد من أن Sheet قابل للكتابة
3. تحقق من أن لا توجد merged cells في الصف الأول

#### المشكلة 4: البيانات تُحفظ لكن بشكل خاطئ

**الحل**:

1. تحقق من أن Headers في Script تطابق Headers في Sheet
2. تأكد من أن ترتيب الأعمدة صحيح

### الخطوة 5: Debugging محسّن

أضف console.log في الكود للتحقق:

```typescript
// في src/lib/googleSheets.ts
console.log("📤 Sending data:", {
  url: GOOGLE_SHEETS_WEB_APP_URL,
  rowsCount: rows.length,
  firstRow: rows[0],
});
```

### الخطوة 6: التحقق من Environment Variables

1. تأكد من وجود ملف `.env` في جذر المشروع
2. تأكد من وجود `VITE_GOOGLE_SHEETS_WEB_APP_URL` في الملف
3. تأكد من أن `.env` موجود في `.gitignore` (لحماية المعلومات الحساسة)
4. أعد تشغيل خادم التطوير بعد إضافة/تعديل Environment Variables

## حل بديل: استخدام CSV Export

إذا استمرت المشكلة، يمكنك الاعتماد على CSV Export:

1. المستخدمون يحمّلون CSV من Summary Screen
2. تجمع جميع CSV files
3. تدمجها في Google Sheets يدوياً أو باستخدام script

## أفضل قاعدة بيانات لـ JASP

### التوصية: Google Sheets → CSV → JASP

**لماذا Google Sheets؟**

1. ✅ سهل الاستخدام والتعاون
2. ✅ يمكن تصديره إلى CSV بسهولة
3. ✅ يدعم Real-time collaboration
4. ✅ مجاني
5. ✅ يمكن ربطه بـ JASP عبر CSV Export

**لماذا CSV لـ JASP؟**

1. ✅ JASP يدعم CSV بشكل ممتاز
2. ✅ سهل الاستيراد
3. ✅ لا يحتاج إعدادات معقدة
4. ✅ يعمل على جميع المنصات

### خطوات استخدام Google Sheets مع JASP:

1. **جمع البيانات في Google Sheets** (كما هو الآن)
2. **تصدير إلى CSV**:
   - File → Download → Comma Separated Values (.csv)
3. **استيراد في JASP**:
   - File → Open → Data File
   - اختر CSV file
   - JASP سيتعرف على الأعمدة تلقائياً

### بدائل أخرى لـ JASP:

#### 1. **Excel (.xlsx)**

- ✅ JASP يدعم Excel
- ✅ سهل الاستخدام
- ❌ قد يحتاج تحويل من Google Sheets

#### 2. **SPSS (.sav)**

- ✅ Format محسّن للإحصائيات
- ❌ يحتاج تحويل من Google Sheets
- ❌ قد يحتاج SPSS license

#### 3. **SQLite Database**

- ✅ قاعدة بيانات حقيقية
- ✅ يدعمها JASP
- ❌ أكثر تعقيداً
- ❌ يحتاج إعدادات إضافية

### التوصية النهائية:

**استخدم Google Sheets → CSV → JASP**

هذا هو الأسهل والأكثر موثوقية لدراستك.
