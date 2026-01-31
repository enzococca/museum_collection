from flask import current_app, render_template_string
from flask_mail import Message
from ..extensions import mail


APPROVAL_TEMPLATE = """
Dear {{ researcher_name }},

We are pleased to inform you that your artifact submission has been approved and added to our museum collection.

Submission Details:
- Object: {{ object_name }}
- Artifact ID: {{ artifact_id }}

Thank you for your contribution to our collection.

Best regards,
Museum Collection Team
"""

REJECTION_TEMPLATE = """
Dear {{ researcher_name }},

Thank you for your submission to our museum collection.

After careful review, we regret to inform you that your submission could not be accepted at this time.

{% if reason %}
Reason: {{ reason }}
{% endif %}

If you have any questions, please feel free to contact us.

Best regards,
Museum Collection Team
"""


def send_submission_notification(email: str, researcher_name: str, status: str,
                                  artifact_id: str = None, reason: str = None):
    """Send email notification about submission status"""
    try:
        if status == 'approved':
            subject = "Your Museum Submission Has Been Approved"
            body = render_template_string(
                APPROVAL_TEMPLATE,
                researcher_name=researcher_name,
                artifact_id=artifact_id,
                object_name="Artifact"
            )
        else:
            subject = "Update on Your Museum Submission"
            body = render_template_string(
                REJECTION_TEMPLATE,
                researcher_name=researcher_name,
                reason=reason
            )

        msg = Message(
            subject=subject,
            recipients=[email],
            body=body,
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )

        mail.send(msg)
        current_app.logger.info(f'Email sent to {email}')

    except Exception as e:
        current_app.logger.error(f'Failed to send email to {email}: {str(e)}')
        raise
