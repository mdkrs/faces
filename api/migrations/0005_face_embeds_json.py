# Generated by Django 4.2.6 on 2024-04-26 13:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_face_face_alter_imagelink_labeled_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='face',
            name='embeds_json',
            field=models.TextField(blank=True, default=''),
        ),
    ]
