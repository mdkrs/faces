# Generated by Django 4.2.6 on 2024-04-26 14:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_face_embeds_json'),
    ]

    operations = [
        migrations.RenameField(
            model_name='imagelink',
            old_name='is_accepted',
            new_name='is_updated',
        ),
    ]
