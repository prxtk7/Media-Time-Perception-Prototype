> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# دليل تحليل البيانات - Data Analysis Guide

## هيكل البيانات في Google Sheets

تم تحسين هيكل البيانات لتسهيل التحليل الإحصائي. كل صف يمثل حالة واحدة (condition) لكل مشارك.

### الأعمدة الرئيسية

#### 1. معلومات المشارك (Participant Information)
- **Participant ID**: معرف فريد لكل مشارك
- **Participant Number**: رقم تسلسلي للمشارك (1, 2, 3, ...)
- **Order Number**: رقم ترتيب Latin-square (1-6)
- **Condition Order**: ترتيب الشروط (مثال: "V-A-T" = Video-Audio-Text)

#### 2. البيانات الديموغرافية (Demographics)
- **Age**: العمر
- **Short Videos Frequency**: تكرار مشاهدة الفيديوهات القصيرة
- **Audio Frequency**: تكرار الاستماع للمحتوى الصوتي
- **Text Frequency**: تكرار قراءة النصوص
- **Caffeine Consumed**: استهلاك الكافيين (Yes/No)
- **Caffeine Time Ago**: وقت آخر استهلاك للكافيين
- **Alertness**: مستوى اليقظة (1-5)

#### 3. بيانات الحالة (Condition Data)
- **Condition**: نوع الحالة (video/audio/text)
- **Condition Position**: موضع الحالة في الترتيب (1, 2, أو 3)
- **Real Duration (sec)**: المدة الفعلية بالثواني
- **Estimated Duration (sec)**: المدة المقدرة بالثواني
- **Temporal Bias (sec)**: الانحياز الزمني بالثواني (estimated - real)
- **Temporal Bias (%)**: الانحياز الزمني كنسبة مئوية
- **Confidence**: الثقة في التقدير (1-5)

#### 4. درجات الانغماس (Immersion Scores)
- **Immersion 1-5**: العناصر الخمسة للانغماس (1-5)
- **Immersion Mean**: متوسط الانغماس

#### 5. درجات الانخراط (Engagement Scores)
- **Engagement 1-5**: العناصر الخمسة للانخراط (1-5)
- **Engagement Mean**: متوسط الانخراط
- **Overall Engagement**: الانخراط الإجمالي (متوسط الانغماس + الانخراط)

#### 6. عوامل إضافية
- **Familiarity**: الألفة مع الموضوع (1-5)

#### 7. البيانات الوصفية (Metadata)
- **Timestamp**: الطابع الزمني الكامل
- **Date**: التاريخ
- **Time**: الوقت

## Latin-Square Counterbalancing

تم استخدام طريقة Latin-square لضمان توزيع متوازن لترتيب الشروط:

### الترتيبات الستة الممكنة:
1. **Order 1**: Video → Audio → Text (V-A-T)
2. **Order 2**: Video → Text → Audio (V-T-A)
3. **Order 3**: Audio → Video → Text (A-V-T)
4. **Order 4**: Audio → Text → Video (A-T-V)
5. **Order 5**: Text → Video → Audio (T-V-A)
6. **Order 6**: Text → Audio → Video (T-A-V)

### كيفية التوزيع:
- المشارك رقم 1 → Order 1
- المشارك رقم 2 → Order 2
- المشارك رقم 3 → Order 3
- ... وهكذا (دورة من 6)

## أمثلة على التحليل

### 1. تحليل الانحياز الزمني حسب نوع الحالة

```excel
=AVERAGEIF(Condition, "video", Temporal_Bias_sec)
=AVERAGEIF(Condition, "audio", Temporal_Bias_sec)
=AVERAGEIF(Condition, "text", Temporal_Bias_sec)
```

### 2. مقارنة الانغماس والانخراط

```excel
=AVERAGEIF(Condition, "video", Immersion_Mean)
=AVERAGEIF(Condition, "video", Engagement_Mean)
```

### 3. تحليل تأثير ترتيب الحالة

```excel
=AVERAGEIF(Condition_Position, 1, Temporal_Bias_sec)
=AVERAGEIF(Condition_Position, 2, Temporal_Bias_sec)
=AVERAGEIF(Condition_Position, 3, Temporal_Bias_sec)
```

### 4. تحليل حسب Order Number

```excel
=AVERAGEIF(Order_Number, 1, Temporal_Bias_sec)
=AVERAGEIF(Order_Number, 2, Temporal_Bias_sec)
```

### 5. Pivot Table للتحليل

يمكن إنشاء Pivot Table باستخدام:
- **Rows**: Condition
- **Values**: Temporal Bias (sec), Immersion Mean, Engagement Mean
- **Filters**: Order Number, Condition Position

## نصائح للتحليل

1. **استخدم Pivot Tables**: لتجميع البيانات بسهولة
2. **استخدم Filters**: لتصفية البيانات حسب Order Number أو Condition Position
3. **أنشئ Charts**: لتصور الفروقات بين الشروط
4. **تحقق من التوازن**: تأكد من أن كل Order Number له نفس العدد من المشاركين

## تصدير البيانات

يمكن تصدير البيانات من Google Sheets إلى:
- Excel (.xlsx)
- CSV (.csv)
- SPSS (.sav) - بعد التصدير كـ CSV

## ملاحظات مهمة

- كل مشارك له 3 صفوف (واحد لكل حالة)
- Order Number يحدد ترتيب الشروط لكل مشارك
- Condition Position يحدد موضع كل حالة في الترتيب (1 = أولاً، 2 = ثانياً، 3 = ثالثاً)
- Temporal Bias (%) مفيد للمقارنة بين الحالات المختلفة في المدة
