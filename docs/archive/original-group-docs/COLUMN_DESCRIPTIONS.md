> **Archived.** This file documents the original group version of the prototype and is kept for reference only. It describes an older data schema (including a participant-name column) and setup steps that no longer match the code. Follow the current documentation in [`README.md`](../../../README.md) and [`docs/`](../../).

# وصف الأعمدة - Column Descriptions

## ملاحظة مهمة
جميع أسماء الأعمدة بدون مسافات أو رموز خاصة لتكون مناسبة للتحليل في JASP وبرامج التحليل الإحصائي الأخرى.

---

## معلومات المشارك

| العمود | الوصف | النوع | القيم الممكنة |
|--------|-------|------|---------------|
| **ParticipantID** | معرف فريد لكل مشارك | نص | مثال: PT-ABC123 |
| **ParticipantName** | اسم المشارك | نص | - |
| **ConsentDate** | تاريخ الموافقة | تاريخ | - |
| **ParticipantNumber** | رقم تسلسلي للمشارك | عدد | 1, 2, 3, ... |
| **LatinSquareOrder** | رقم ترتيب Latin-square | عدد | 1, 2, 3, 4, 5, 6 |
| **ConditionOrder** | ترتيب الشروط | نص | V-A-T, V-T-A, A-V-T, A-T-V, T-V-A, T-A-V |

---

## البيانات الديموغرافية

| العمود | الوصف | النوع | القيم الممكنة |
|--------|-------|------|---------------|
| **Age** | العمر بالسنوات | عدد | أي عدد صحيح |
| **ShortVideosFrequency** | تكرار مشاهدة الفيديوهات القصيرة | نص | very_rarely, rarely, sometimes, often, very_often |
| **AudioFrequency** | تكرار الاستماع للمحتوى الصوتي | نص | very_rarely, rarely, sometimes, often, very_often |
| **TextFrequency** | تكرار قراءة النصوص | نص | very_rarely, rarely, sometimes, often, very_often |
| **CaffeineConsumed** | استهلاك الكافيين اليوم | نص | Yes, No |
| **CaffeineTimeAgo** | وقت آخر استهلاك للكافيين | نص | less_than_1_hour, 1_to_3_hours, more_than_3_hours |
| **AlertnessLevel** | مستوى اليقظة الحالي | عدد | 1 (Very tired) إلى 5 (Very alert) |

---

## بيانات الحالة (Condition)

| العمود | الوصف | النوع | القيم الممكنة |
|--------|-------|------|---------------|
| **Condition** | نوع الحالة | نص | video, audio, text |
| **ConditionPosition** | موضع الحالة في الترتيب | عدد | 1 (أولاً), 2 (ثانياً), 3 (ثالثاً) |
| **RealDurationSeconds** | المدة الفعلية بالثواني | عدد | 180 (للفيديو/الصوت) أو متغير (للنص) |
| **EstimatedDurationSeconds** | المدة المقدرة بالثواني | عدد | أي عدد |
| **TemporalBiasSeconds** | الانحياز الزمني بالثواني | عدد | سالب = تقدير أقل، موجب = تقدير أكثر |
| **TemporalBiasPercent** | الانحياز الزمني كنسبة مئوية | عدد | سالب = تقدير أقل، موجب = تقدير أكثر |
| **ConfidenceRating** | الثقة في التقدير | عدد | 1 (Not confident) إلى 5 (Extremely confident) |

---

## درجات الانغماس (Immersion) - مقياس 1-5

| العمود | الوصف | السؤال |
|--------|-------|---------|
| **Immersion_Absorbed** | "I felt absorbed while experiencing the media" | 1 = Strongly disagree, 5 = Strongly agree |
| **Immersion_Focused** | "I became deeply focused on the media" | 1 = Strongly disagree, 5 = Strongly agree |
| **Immersion_LostAwareness** | "I lost awareness of my surroundings" | 1 = Strongly disagree, 5 = Strongly agree |
| **Immersion_UnawareSurroundings** | "I was unaware of things happening around me" | 1 = Strongly disagree, 5 = Strongly agree |
| **Immersion_LostTrackTime** | "I lost track of time while experiencing the media" | 1 = Strongly disagree, 5 = Strongly agree |
| **Immersion_Mean** | متوسط الانغماس | حساب تلقائي (متوسط العناصر الخمسة) |

---

## درجات الانخراط (Engagement) - مقياس 1-5

| العمود | الوصف | السؤال |
|--------|-------|---------|
| **Engagement_Engaging** | "I found the media engaging" | 1 = Strongly disagree, 5 = Strongly agree |
| **Engagement_MentallyInvolved** | "I felt mentally involved while experiencing the media" | 1 = Strongly disagree, 5 = Strongly agree |
| **Engagement_HeldAttention** | "The media held my attention" | 1 = Strongly disagree, 5 = Strongly agree |
| **Engagement_Interested** | "I was interested in the media throughout the experience" | 1 = Strongly disagree, 5 = Strongly agree |
| **Engagement_Motivated** | "I was motivated to keep paying attention to the media" | 1 = Strongly disagree, 5 = Strongly agree |
| **Engagement_Mean** | متوسط الانخراط | حساب تلقائي (متوسط العناصر الخمسة) |
| **OverallEngagement** | الانخراط الإجمالي | حساب تلقائي (متوسط Immersion_Mean + Engagement_Mean) |

---

## عوامل إضافية

| العمود | الوصف | النوع | القيم الممكنة |
|--------|-------|------|---------------|
| **Familiarity** | الألفة مع الموضوع | عدد | 1 (Not at all familiar) إلى 5 (Extremely familiar) |

---

## بيانات وصفية

| العمود | الوصف | النوع |
|--------|-------|------|
| **Timestamp** | الطابع الزمني الكامل | نص (ISO format) |
| **Date** | التاريخ | تاريخ |
| **Time** | الوقت | وقت |

---

## ملاحظات للتحليل

1. **كل صف = حالة واحدة**: كل صف يمثل حالة واحدة (video أو audio أو text) لمشارك واحد
2. **كل مشارك = 3 صفوف**: كل مشارك له 3 صفوف (واحد لكل حالة)
3. **LatinSquareOrder**: يحدد ترتيب الشروط لكل مشارك (1-6)
4. **ConditionPosition**: يحدد موضع كل حالة في الترتيب (1 = أولاً، 2 = ثانياً، 3 = ثالثاً)
5. **TemporalBiasSeconds**: 
   - سالب = المشارك قدّر وقتاً أقل من المدة الفعلية
   - موجب = المشارك قدّر وقتاً أكثر من المدة الفعلية
6. **جميع المقاييس من 1-5**: Immersion و Engagement و Familiarity و Confidence

---

## للتحليل في JASP

- استخدم **Condition** كعامل (Factor) للتحليل
- استخدم **TemporalBiasSeconds** أو **TemporalBiasPercent** كمتغير تابع (Dependent Variable)
- استخدم **Immersion_Mean** و **Engagement_Mean** كمتغيرات مستقلة (Independent Variables)
- استخدم **ParticipantID** لتحديد المشاركين في التحليل
