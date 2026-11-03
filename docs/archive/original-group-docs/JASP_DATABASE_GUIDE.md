> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# JASP Database Guide - أفضل قاعدة بيانات لـ JASP

## التوصية: Google Sheets → CSV → JASP

### لماذا هذا الخيار الأفضل؟

1. **سهولة الاستخدام**: Google Sheets سهل الاستخدام والتعاون
2. **التوافق الممتاز**: JASP يدعم CSV بشكل ممتاز
3. **لا يحتاج إعدادات معقدة**: تصدير بسيط واستيراد مباشر
4. **مجاني**: Google Sheets مجاني
5. **Real-time Collaboration**: يمكن للفريق العمل معاً

## خطوات العمل مع JASP

### الخطوة 1: جمع البيانات في Google Sheets
- البيانات تُحفظ تلقائياً في Google Sheets (إذا كان الإعداد صحيحاً)
- أو يمكن جمع CSV files من المستخدمين

### الخطوة 2: تصدير من Google Sheets إلى CSV

**الطريقة 1: من Google Sheets**
1. افتح Google Sheet
2. File → Download → Comma Separated Values (.csv)
3. احفظ الملف

**الطريقة 2: باستخدام Google Apps Script**
```javascript
function exportToCSV() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const csv = data.map(row => row.join(',')).join('\n');
  
  // Save to Drive or email
  DriveApp.createFile('data.csv', csv, MimeType.CSV);
}
```

### الخطوة 3: استيراد في JASP

1. افتح JASP
2. File → Open → Data File
3. اختر CSV file
4. JASP سيتعرف على الأعمدة تلقائياً
5. تحقق من أن أنواع البيانات صحيحة (Numeric, Nominal, Ordinal)

## هيكل البيانات الموصى به لـ JASP

### الأعمدة المهمة للتحليل:

#### Variables للتحليل:
- **Condition** (Nominal): video, audio, text
- **TemporalBias** (Scale/Numeric): الفرق بين التقدير والوقت الفعلي
- **ImmersionMean** (Scale/Numeric): متوسط الانغماس
- **EngagementMean** (Scale/Numeric): متوسط الانخراط
- **OverallEngagement** (Scale/Numeric): الانخراط الإجمالي
- **Confidence** (Ordinal): 1-5
- **Familiarity** (Ordinal): 1-5

#### Covariates (متغيرات مساعدة):
- **Age** (Scale/Numeric)
- **Alertness** (Ordinal): 1-5
- **ConditionPosition** (Ordinal): 1, 2, 3
- **OrderNumber** (Ordinal): 1-6 (Latin-square)

#### Grouping Variables:
- **ParticipantID** (Nominal): لتحديد المشاركين
- **ConditionOrder** (Nominal): V-A-T, A-T-V, etc.

## أنواع التحليلات الممكنة في JASP

### 1. Repeated Measures ANOVA
- **Dependent Variable**: TemporalBias
- **Within-Subjects Factor**: Condition (video, audio, text)
- **Covariates**: Age, Alertness, ConditionPosition

### 2. Correlation Analysis
- **Variables**: ImmersionMean, EngagementMean, TemporalBias, Confidence

### 3. Linear Regression
- **Dependent Variable**: TemporalBias
- **Predictors**: ImmersionMean, EngagementMean, Condition, Familiarity

### 4. Mixed Models
- **Fixed Effects**: Condition, ImmersionMean, EngagementMean
- **Random Effects**: ParticipantID (للمشاركين)

## بدائل أخرى لـ JASP

### 1. Excel (.xlsx)
**المميزات:**
- ✅ JASP يدعم Excel مباشرة
- ✅ سهل الاستخدام

**العيوب:**
- ❌ قد يحتاج تحويل من Google Sheets
- ❌ قد يفقد بعض التنسيق

**الاستخدام:**
- File → Download → Microsoft Excel (.xlsx)
- ثم استيراد في JASP

### 2. SPSS (.sav)
**المميزات:**
- ✅ Format محسّن للإحصائيات
- ✅ يحفظ أنواع البيانات (Nominal, Ordinal, Scale)

**العيوب:**
- ❌ يحتاج SPSS license للتحويل
- ❌ أكثر تعقيداً

### 3. SQLite Database
**المميزات:**
- ✅ قاعدة بيانات حقيقية
- ✅ يدعمها JASP عبر Qt SQL plugin
- ✅ جيد للبيانات الكبيرة

**العيوب:**
- ❌ يحتاج إعدادات إضافية
- ❌ أكثر تعقيداً من CSV

**الاستخدام:**
1. تصدير من Google Sheets إلى CSV
2. استيراد CSV في SQLite
3. ربط JASP بـ SQLite database

## التوصية النهائية

### للدراسة الحالية: **Google Sheets → CSV → JASP**

**الأسباب:**
1. ✅ سهل الاستخدام
2. ✅ لا يحتاج إعدادات معقدة
3. ✅ JASP يدعم CSV بشكل ممتاز
4. ✅ يمكن تصدير CSV بسهولة من Google Sheets
5. ✅ يعمل على جميع المنصات

### خطوات العمل:
1. **جمع البيانات**: Google Sheets (تلقائياً أو CSV manual)
2. **تصدير**: File → Download → CSV
3. **استيراد في JASP**: File → Open → Data File
4. **التحليل**: اختر التحليل المناسب في JASP

## نصائح إضافية

### 1. تنظيف البيانات قبل الاستيراد
- تأكد من عدم وجود قيم فارغة في الأعمدة المهمة
- تحقق من أن الأرقام هي أرقام وليست نصوص
- تأكد من أن القيم الاسمية (Nominal) متسقة

### 2. تسمية الأعمدة
- استخدم أسماء واضحة (مثل: `TemporalBias` بدلاً من `TB`)
- تجنب المسافات (استخدم `_` أو `CamelCase`)
- استخدم أسماء قصيرة لكن واضحة

### 3. أنواع البيانات في JASP
- **Scale**: أرقام مستمرة (مثل: TemporalBias, ImmersionMean)
- **Ordinal**: أرقام مرتبة (مثل: Confidence 1-5, Alertness 1-5)
- **Nominal**: فئات (مثل: Condition: video/audio/text)

### 4. Backup
- احفظ نسخة من CSV قبل التحليل
- استخدم Google Sheets version history
- احفظ نسخ متعددة من البيانات

## الخلاصة

**استخدم Google Sheets لجمع البيانات، ثم صدّر إلى CSV واستورده في JASP.**

هذا هو الأسهل والأكثر موثوقية لدراستك.
