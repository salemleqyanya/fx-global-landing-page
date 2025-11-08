# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0002_customercontact_address_customercontact_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='customercontact',
            name='phone',
            field=models.CharField(blank=True, default='', max_length=20, verbose_name='رقم الجوال'),
        ),
    ]

