from django.contrib import admin

from .models import ExamParticipant, ExamQuestion, ExamSubmission


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'correct_answer', 'order', 'is_active']
    list_filter = ['is_active', 'correct_answer']
    search_fields = ['title', 'explanation']
    ordering = ['order']


class ExamSubmissionInline(admin.TabularInline):
    model = ExamSubmission
    extra = 0
    readonly_fields = ['question', 'selected_answer', 'is_correct', 'created_at']
    can_delete = False


@admin.register(ExamParticipant)
class ExamParticipantAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'phone',
        'email',
        'last_score',
        'last_rating_value',
        'last_result_at',
        'created_at',
    ]
    list_filter = ['last_rating_value', 'last_result_at', 'created_at']
    search_fields = ['name', 'phone', 'email']
    date_hierarchy = 'created_at'
    inlines = [ExamSubmissionInline]
    readonly_fields = [
        'created_at',
        'last_result_at',
        'last_score',
        'last_correct_answers',
        'last_total_questions',
        'last_rating_value',
        'last_rating_message',
    ]


@admin.register(ExamSubmission)
class ExamSubmissionAdmin(admin.ModelAdmin):
    list_display = ['participant', 'question', 'selected_answer', 'is_correct', 'created_at']
    list_filter = ['is_correct', 'selected_answer', 'question']
    search_fields = ['participant__name', 'participant__phone', 'question__title']
    readonly_fields = ['created_at']

