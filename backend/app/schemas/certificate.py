from datetime import date
from pydantic import BaseModel


class CertificateCreate(BaseModel):
    certificate_id: str
    student_name: str
    student_id: str
    course: str
    institute: str
    issue_date: date