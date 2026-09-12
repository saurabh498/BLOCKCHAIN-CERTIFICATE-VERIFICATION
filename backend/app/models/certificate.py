from datetime import date, datetime

from sqlalchemy import String, Date, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    certificate_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    student_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    student_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    course: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    institute: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    issue_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    file_path: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    certificate_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True
    )

    blockchain_tx_hash: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="ACTIVE",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )