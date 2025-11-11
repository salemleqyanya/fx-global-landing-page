from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0004_landingpage_customercontact_landing_page'),
    ]

    operations = [
        migrations.AddField(
            model_name='landingpage',
            name='template',
            field=models.CharField(choices=[('classic', 'التصميم الكلاسيكي'), ('neon', 'تصميم نيو-نيون')], default='classic', max_length=20, verbose_name='التصميم'),
        ),
    ]

