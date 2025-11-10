from django import forms

from .models import ExamParticipant, ExamQuestion


class ExamEntryForm(forms.ModelForm):
    class Meta:
        model = ExamParticipant
        fields = ['name', 'phone', 'email']
        labels = {
            'name': 'الاسم الكامل',
            'phone': 'رقم الجوال',
            'email': 'البريد الإلكتروني (اختياري)',
        }
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'exam-input',
                'placeholder': 'أدخل اسمك الكامل',
                'autocomplete': 'name',
                'required': True,
            }),
            'phone': forms.TextInput(attrs={
                'class': 'exam-input',
                'placeholder': 'مثال: 0599123456',
                'inputmode': 'tel',
                'autocomplete': 'tel',
                'required': True,
            }),
            'email': forms.EmailInput(attrs={
                'class': 'exam-input',
                'placeholder': 'اختياري',
                'autocomplete': 'email',
            }),
        }

    def clean_phone(self):
        phone = self.cleaned_data.get('phone', '').strip()
        if not phone:
            raise forms.ValidationError('رقم الجوال مطلوب.')
        return phone

    def save(self, commit=True):
        """
        Ensure a participant is unique per phone number.
        Update existing record instead of creating duplicates.
        """
        from django.utils import timezone

        phone = self.cleaned_data['phone']
        defaults = {
            'name': self.cleaned_data['name'],
            'email': self.cleaned_data.get('email'),
        }
        participant, created = ExamParticipant.objects.get_or_create(
            phone=phone,
            defaults=defaults,
        )
        if not created:
            participant.name = defaults['name']
            participant.email = defaults['email']
            participant.created_at = participant.created_at
            participant.last_result_at = participant.last_result_at or timezone.now()
            if commit:
                participant.save(update_fields=['name', 'email', 'last_result_at'])
        elif commit:
            participant.save()
        return participant


class ExamForm(forms.Form):
    """Dynamic form that renders buy/sell choice for each question."""

    def __init__(self, *args, **kwargs):
        questions = kwargs.pop('questions')
        super().__init__(*args, **kwargs)

        for question in questions:
            field_name = f'question_{question.id}'
            self.fields[field_name] = forms.ChoiceField(
                choices=ExamQuestion.ANSWER_CHOICES,
                label=question.title,
                widget=forms.RadioSelect(attrs={
                    'class': 'flex gap-3 text-sm sm:text-base text-white',
                }),
                required=True,
            )

