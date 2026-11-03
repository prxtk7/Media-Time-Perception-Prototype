> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# دليل التحليل في JASP - JASP Analysis Guide

## هيكل البيانات

تم تحسين أسماء الأعمدة لتكون واضحة ومناسبة للتحليل في JASP. جميع الأعمدة بدون مسافات أو رموز خاصة.

## قائمة الأعمدة (Variables)

### معلومات المشارك (Participant Variables)
- **ParticipantID**: معرف فريد لكل مشارك
- **ParticipantName**: اسم المشارك
- **ConsentDate**: تاريخ الموافقة
- **ParticipantNumber**: رقم تسلسلي (1, 2, 3, ...)
- **LatinSquareOrder**: رقم ترتيب Latin-square (1-6)
- **ConditionOrder**: ترتيب الشروط (V-A-T, V-T-A, إلخ)

### البيانات الديموغرافية (Demographic Variables)
- **Age**: العمر (عدد صحيح)
- **ShortVideosFrequency**: تكرار مشاهدة الفيديوهات القصيرة (very_rarely, rarely, sometimes, often, very_often)
- **AudioFrequency**: تكرار الاستماع للمحتوى الصوتي (very_rarely, rarely, sometimes, often, very_often)
- **TextFrequency**: تكرار قراءة النصوص (very_rarely, rarely, sometimes, often, very_often)
- **CaffeineConsumed**: استهلاك الكافيين (Yes/No)
- **CaffeineTimeAgo**: وقت آخر استهلاك (less_than_1_hour, 1_to_3_hours, more_than_3_hours)
- **AlertnessLevel**: مستوى اليقظة (1-5)

### بيانات الحالة (Condition Variables)
- **Condition**: نوع الحالة (video, audio, text)
- **ConditionPosition**: موضع الحالة في الترتيب (1, 2, 3)
- **RealDurationSeconds**: المدة الفعلية بالثواني (عدد)
- **EstimatedDurationSeconds**: المدة المقدرة بالثواني (عدد)
- **TemporalBiasSeconds**: الانحياز الزمني بالثواني (عدد - يمكن أن يكون سالب)
- **TemporalBiasPercent**: الانحياز الزمني كنسبة مئوية (عدد - يمكن أن يكون سالب)
- **ConfidenceRating**: الثقة في التقدير (1-5)

### درجات الانغماس (Immersion Variables - Scale 1-5)
- **Immersion_Absorbed**: "I felt absorbed while experiencing the media" (1-5)
- **Immersion_Focused**: "I became deeply focused on the media" (1-5)
- **Immersion_LostAwareness**: "I lost awareness of my surroundings" (1-5)
- **Immersion_UnawareSurroundings**: "I was unaware of things happening around me" (1-5)
- **Immersion_LostTrackTime**: "I lost track of time while experiencing the media" (1-5)
- **Immersion_Mean**: متوسط الانغماس (حساب تلقائي)

### درجات الانخراط (Engagement Variables - Scale 1-5)
- **Engagement_Engaging**: "I found the media engaging" (1-5)
- **Engagement_MentallyInvolved**: "I felt mentally involved while experiencing the media" (1-5)
- **Engagement_HeldAttention**: "The media held my attention" (1-5)
- **Engagement_Interested**: "I was interested in the media throughout the experience" (1-5)
- **Engagement_Motivated**: "I was motivated to keep paying attention to the media" (1-5)
- **Engagement_Mean**: متوسط الانخراط (حساب تلقائي)
- **OverallEngagement**: الانخراط الإجمالي (متوسط الانغماس + الانخراط)

### عوامل إضافية (Additional Variables)
- **Familiarity**: الألفة مع الموضوع (1-5)

### بيانات وصفية (Metadata)
- **Timestamp**: الطابع الزمني الكامل
- **Date**: التاريخ
- **Time**: الوقت

## إعداد البيانات في JASP

### 1. استيراد البيانات
1. افتح JASP
2. File > Open > Data
3. اختر ملف CSV المُصدّر من Google Sheets
4. تأكد من أن JASP يقرأ الأعمدة بشكل صحيح

### 2. تحديد أنواع المتغيرات (Variable Types)

#### Nominal (فئوي):
- ParticipantID
- ParticipantName
- Condition (video/audio/text)
- ConditionOrder
- ShortVideosFrequency
- AudioFrequency
- TextFrequency
- CaffeineConsumed
- CaffeineTimeAgo

#### Ordinal (ترتيبي):
- LatinSquareOrder (1-6)
- ConditionPosition (1, 2, 3)
- AlertnessLevel (1-5)
- ConfidenceRating (1-5)
- جميع Immersion_* (1-5)
- جميع Engagement_* (1-5)
- Familiarity (1-5)

#### Scale (مستمر):
- Age
- RealDurationSeconds
- EstimatedDurationSeconds
- TemporalBiasSeconds
- TemporalBiasPercent
- Immersion_Mean
- Engagement_Mean
- OverallEngagement

### 3. تحويل البيانات للتحليل

#### إنشاء متغيرات جديدة:
- **ConditionType**: تحويل Condition إلى عوامل (Factors) للتحليل
- **OrderGroup**: تجميع LatinSquareOrder إذا لزم الأمر

## أمثلة على التحليل في JASP

### 1. ANOVA للانحياز الزمني حسب نوع الحالة

**T-Tests > ANOVA**
- Dependent Variable: `TemporalBiasSeconds`
- Fixed Factors: `Condition`
- Options: Include effect size, Include descriptives

### 2. ANOVA للانغماس حسب نوع الحالة

**T-Tests > ANOVA**
- Dependent Variable: `Immersion_Mean`
- Fixed Factors: `Condition`
- Post Hoc Tests: Bonferroni

### 3. ANOVA للانخراط حسب نوع الحالة

**T-Tests > ANOVA**
- Dependent Variable: `Engagement_Mean`
- Fixed Factors: `Condition`
- Post Hoc Tests: Bonferroni

### 4. تحليل تأثير ترتيب الحالة

**T-Tests > ANOVA**
- Dependent Variable: `TemporalBiasSeconds`
- Fixed Factors: `ConditionPosition`
- Options: Include descriptives

### 5. تحليل الارتباط

**Regression > Correlation**
- Variables: 
  - `TemporalBiasSeconds`
  - `Immersion_Mean`
  - `Engagement_Mean`
  - `ConfidenceRating`
  - `Familiarity`

### 6. تحليل الانحدار

**Regression > Linear Regression**
- Dependent Variable: `TemporalBiasSeconds`
- Covariates: `Immersion_Mean`, `Engagement_Mean`, `ConfidenceRating`, `Familiarity`

### 7. تحليل تأثير Latin Square Order

**T-Tests > ANOVA**
- Dependent Variable: `TemporalBiasSeconds`
- Fixed Factors: `Condition`, `LatinSquareOrder`
- Options: Include interaction effects

## نصائح للتحليل

1. **استخدم Descriptives أولاً**: لفهم البيانات
2. **تحقق من الافتراضات**: Normality, Homogeneity of variance
3. **استخدم Post Hoc Tests**: عند وجود فروق معنوية
4. **احسب Effect Sizes**: لفهم حجم التأثير
5. **راجع Interaction Effects**: بين Condition و LatinSquareOrder

## ملاحظات مهمة

- كل صف يمثل حالة واحدة (condition) لمشارك واحد
- كل مشارك له 3 صفوف (واحد لكل حالة)
- استخدم `ParticipantID` كمعرف فريد للمشاركين
- `ConditionPosition` يحدد موضع الحالة في الترتيب (1 = أولاً، 2 = ثانياً، 3 = ثالثاً)
- `TemporalBiasSeconds` سالب = تقدير أقل من المدة الفعلية
- `TemporalBiasSeconds` موجب = تقدير أكثر من المدة الفعلية

## تصدير النتائج

يمكن تصدير النتائج من JASP إلى:
- PDF (للتقارير)
- HTML (للعرض على الويب)
- Excel (للتحليل الإضافي)
