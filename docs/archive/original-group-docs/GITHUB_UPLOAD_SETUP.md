> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# GitHub CSV Upload Setup

## ملاحظة مهمة

رفع الملفات إلى GitHub من المتصفح **غير ممكن مباشرة** لأسباب أمنية. لكن يمكن:

1. ✅ **تحميل CSV تلقائياً** (تم إضافته)
2. ✅ **إرسال البيانات إلى Google Sheets** (موجود بالفعل)
3. ⚙️ **رفع CSV إلى GitHub عبر API** (يحتاج إعدادات إضافية)

## الخيار 1: التحميل التلقائي (موصى به)

الآن CSV يتم تحميله تلقائياً عند انتهاء التجربة. المستخدمون يمكنهم:
- حفظ الملفات محلياً
- رفعها يدوياً إلى Google Sheets أو أي مكان آخر

## الخيار 2: رفع تلقائي إلى GitHub (اختياري)

إذا كنت تريد رفع CSV تلقائياً إلى GitHub، تحتاج:

### الخطوة 1: إنشاء GitHub Personal Access Token

1. اذهب إلى GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. انقر "Generate new token (classic)"
3. أعطِه اسم (مثل: "CSV Upload Token")
4. اختر الصلاحيات:
   - `repo` (Full control of private repositories)
5. انسخ Token

### الخطوة 2: إضافة Environment Variables

1. أنشئ ملف `.env` في جذر المشروع (إذا لم يكن موجوداً)
2. أضف:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Token الذي نسخته

3. (اختياري) أضف:
   - **Name**: `GITHUB_REPO`
   - **Value**: `<owner>/<repo>` (أو اسم repo الخاص بك)
   - **Name**: `GITHUB_BRANCH`
   - **Value**: `main`
   - **Name**: `GITHUB_CSV_PATH`
   - **Value**: `data` (المجلد الذي سيحفظ فيه CSV files)

### الخطوة 3: تفعيل GitHub Upload

1. في ملف `.env`، أضف:
   - **Name**: `VITE_GITHUB_UPLOAD_ENABLED`
   - **Value**: `true`

2. أعد تشغيل خادم التطوير

### الخطوة 4: إنشاء مجلد data في GitHub

```bash
cd <path-to-project>
mkdir -p data
echo "# Data files" > data/README.md
git add data/
git commit -m "Add data folder for CSV uploads"
git push origin main
```

## ملاحظات أمنية

⚠️ **GitHub Token حساس**:
- لا تشاركه أبداً
- لا تضعه في الكود
- استخدمه فقط في ملف `.env` (وتأكد من إضافة `.env` إلى `.gitignore`)
- إذا تم تسريبه، احذفه فوراً وأنشئ واحد جديد

## التوصية

**استخدم Google Sheets** بدلاً من GitHub:
- ✅ أسهل في الإعداد
- ✅ لا يحتاج tokens
- ✅ يمكن تصديره إلى CSV بسهولة
- ✅ Real-time collaboration
- ✅ مجاني

CSV التحميل التلقائي كافٍ لمعظم الحالات.
