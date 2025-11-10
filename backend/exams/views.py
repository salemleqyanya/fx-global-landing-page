from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone

from .forms import ExamEntryForm, ExamForm
from .models import ExamParticipant, ExamQuestion, ExamSubmission


ENTRY_SESSION_KEY = 'exam_participant_id'


def exam_qr_view(request):
    """Simple page that holds the QR code image pointing to the exam entry."""
    entry_url = request.build_absolute_uri(reverse('exams:entry'))
    return render(request, 'exams/qr_page.html', {'entry_url': entry_url})


def exam_entry_view(request):
    """First step: student fills the form before accessing the exam."""
    if request.method == 'POST':
        form = ExamEntryForm(request.POST)
        if form.is_valid():
            participant = form.save()
            request.session[ENTRY_SESSION_KEY] = participant.id
            return redirect('exams:start')
    else:
        form = ExamEntryForm()

    return render(request, 'exams/exam_entry.html', {'form': form})


def exam_start_view(request):
    participant_id = request.session.get(ENTRY_SESSION_KEY)
    if not participant_id:
        messages.warning(request, 'يرجى تعبئة النموذج قبل الدخول إلى الاختبار.')
        return redirect('exams:entry')

    participant = get_object_or_404(ExamParticipant, pk=participant_id)
    questions = list(ExamQuestion.objects.filter(is_active=True))

    if not questions:
        return render(request, 'exams/exam_empty.html')

    question_field_pairs = []

    if request.method == 'POST':
        form = ExamForm(request.POST, questions=questions)
        if form.is_valid():
            ExamSubmission.objects.filter(participant=participant).delete()
            results = []
            correct_count = 0

            for question in questions:
                field_name = f'question_{question.id}'
                selected_answer = form.cleaned_data.get(field_name)
                is_correct = selected_answer == question.correct_answer
                ExamSubmission.objects.create(
                    participant=participant,
                    question=question,
                    selected_answer=selected_answer,
                    is_correct=is_correct,
                )
                if is_correct:
                    correct_count += 1
                results.append({
                    'question': question,
                    'selected_answer': selected_answer,
                    'is_correct': is_correct,
                })

            score_percentage = int((correct_count / len(questions)) * 100)

            interest_level = 'متحمس جدًا لعالم التداول!' if score_percentage >= 80 else \
                'عندك فضول جيد، خلينا نشتغل على تعزيز قراراتك.' if score_percentage >= 50 else \
                'يبدو إنك بحاجة لأساسيات أقوى، إحنا جاهزين نساعدك.'

            if score_percentage >= 90:
                rating_value = 5
                rating_message = 'مستوى احتراف ممتاز – قرارك سريع ومبني على قراءة واضحة.'
            elif score_percentage >= 75:
                rating_value = 4
                rating_message = 'قرارك قوي، مع شوية صقل إضافي بنوصل للمرحلة الاحترافية.'
            elif score_percentage >= 55:
                rating_value = 3
                rating_message = 'عندك أساس جيد، وبتحتاج دعم إضافي لتعزيز الثقة بالقرار.'
            elif score_percentage >= 35:
                rating_value = 2
                rating_message = 'لا تشيل هم، بنساعدك تبني القرار الصح خطوة بخطوة.'
            else:
                rating_value = 1
                rating_message = 'بداية قوية للتعرف على عالم التداول، خلينا نرسم الخطة مع بعض.'

            participant.last_score = score_percentage
            participant.last_correct_answers = correct_count
            participant.last_total_questions = len(questions)
            participant.last_rating_value = rating_value
            participant.last_rating_message = rating_message
            participant.last_result_at = timezone.now()
            participant.save(update_fields=[
                'last_score',
                'last_correct_answers',
                'last_total_questions',
                'last_rating_value',
                'last_rating_message',
                'last_result_at',
            ])

            context = {
                'participant': participant,
                'results': results,
                'correct_count': correct_count,
                'total_questions': len(questions),
                'score_percentage': score_percentage,
                'interest_level': interest_level,
                'rating_value': rating_value,
                'rating_message': rating_message,
                'rating_range': range(1, 6),
            }
            return render(request, 'exams/exam_results.html', context)
    else:
        form = ExamForm(questions=questions)

    question_field_pairs = []
    for question in questions:
        bound_field = form[f'question_{question.id}']
        question_field_pairs.append({
            'question': question,
            'field': bound_field,
            'current_value': bound_field.value(),
        })

    return render(request, 'exams/exam_start.html', {
        'form': form,
        'participant': participant,
        'question_field_pairs': question_field_pairs,
    })

