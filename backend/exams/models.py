from django.db import models
from django.utils import timezone


class ExamParticipant(models.Model):
    """Stores basic info about student before taking the trading exam."""

    name = models.CharField(max_length=200, verbose_name="اسم الطالب")
    phone = models.CharField(max_length=20, unique=True, verbose_name="رقم الجوال")
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاريخ الدخول")
    last_score = models.PositiveIntegerField(default=0, verbose_name="آخر نتيجة (٪)")
    last_correct_answers = models.PositiveIntegerField(default=0, verbose_name="عدد الإجابات الصحيحة")
    last_total_questions = models.PositiveIntegerField(default=0, verbose_name="إجمالي الأسئلة")
    last_rating_value = models.PositiveSmallIntegerField(default=0, verbose_name="تقييم الاهتمام (1-5)")
    last_rating_message = models.CharField(max_length=255, blank=True, verbose_name="ملخص التقييم")
    last_result_at = models.DateTimeField(blank=True, null=True, verbose_name="تاريخ آخر نتيجة")

    class Meta:
        verbose_name = "مشارك في الاختبار"
        verbose_name_plural = "المشاركون في الاختبار"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.phone}"


class ExamQuestion(models.Model):
    """Single trading exam question."""

    ANSWER_CHOICES = [
        ('buy', 'شراء'),
        ('sell', 'بيع'),
    ]

    title = models.CharField(max_length=255, verbose_name="عنوان السؤال")
    chart_image = models.ImageField(upload_to='exam/charts/', verbose_name="صورة الشارت (مع طمس نصفها)")
    proof_image = models.ImageField(
        upload_to='exam/proofs/',
        blank=True,
        null=True,
        verbose_name="صورة التوضيح (للإجابة الصحيحة)"
    )
    correct_answer = models.CharField(max_length=10, choices=ANSWER_CHOICES, verbose_name="الإجابة الصحيحة")
    explanation = models.TextField(blank=True, verbose_name="شرح / ملاحظة إضافية")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    is_active = models.BooleanField(default=True, verbose_name="فعال في الاختبار")

    class Meta:
        verbose_name = "سؤال اختبار التداول"
        verbose_name_plural = "أسئلة اختبار التداول"
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class ExamSubmission(models.Model):
    """Stores student answers for each question."""

    participant = models.ForeignKey(
        ExamParticipant,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name="المشارك"
    )
    question = models.ForeignKey(
        ExamQuestion,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name="السؤال"
    )
    selected_answer = models.CharField(max_length=10, choices=ExamQuestion.ANSWER_CHOICES, verbose_name="الإجابة المختارة")
    is_correct = models.BooleanField(default=False, verbose_name="إجابة صحيحة؟")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="وقت الإجابة")

    class Meta:
        verbose_name = "إجابة الطالب"
        verbose_name_plural = "إجابات الطلاب"
        unique_together = ('participant', 'question')

    def __str__(self):
        return f"{self.participant} -> {self.question}"

