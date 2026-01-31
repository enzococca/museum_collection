from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image,
    Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
import io
from flask import current_app
from .dropbox_service import DropboxService


class PDFService:
    def __init__(self):
        self.dropbox = DropboxService()
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Set up custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='ArtifactTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.HexColor('#1a365d')
        ))

        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceBefore=12,
            spaceAfter=6,
            textColor=colors.HexColor('#2d3748')
        ))

        self.styles.add(ParagraphStyle(
            name='FieldLabel',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#718096'),
            spaceBefore=4
        ))

        self.styles.add(ParagraphStyle(
            name='FieldValue',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=8
        ))

        self.styles.add(ParagraphStyle(
            name='CenteredText',
            parent=self.styles['Normal'],
            alignment=TA_CENTER
        ))

    def generate_artifact_pdf(self, artifacts: list, include_images: bool = True) -> bytes:
        """Generate a PDF with artifact information and images"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=1.5*cm,
            leftMargin=1.5*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )

        story = []

        # Title page
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph(
            "Museum Collection Export",
            self.styles['Title']
        ))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(
            f"Total artifacts: {len(artifacts)}",
            self.styles['CenteredText']
        ))
        story.append(PageBreak())

        for artifact in artifacts:
            self._add_artifact_page(story, artifact, include_images)

        doc.build(story)
        buffer.seek(0)
        return buffer.read()

    def _add_artifact_page(self, story: list, artifact, include_images: bool):
        """Add artifact details to PDF"""
        # Title
        story.append(Paragraph(
            f"{artifact.sequence_number}: {artifact.object_type or 'Artifact'}",
            self.styles['ArtifactTitle']
        ))

        # Primary image
        if include_images:
            primary = artifact.primary_media
            if primary:
                try:
                    img_data = self.dropbox.download_file(primary.dropbox_path)
                    img = Image(io.BytesIO(img_data))

                    # Scale to fit
                    max_width = 15*cm
                    max_height = 10*cm
                    img_width, img_height = img.drawWidth, img.drawHeight

                    if img_width > max_width:
                        ratio = max_width / img_width
                        img_width = max_width
                        img_height = img_height * ratio

                    if img_height > max_height:
                        ratio = max_height / img_height
                        img_height = max_height
                        img_width = img_width * ratio

                    img.drawWidth = img_width
                    img.drawHeight = img_height
                    img.hAlign = 'CENTER'

                    story.append(img)
                    story.append(Spacer(1, 0.3*inch))
                except Exception as e:
                    current_app.logger.error(f'Image load error: {str(e)}')

        # Identification section
        story.append(Paragraph("Identification", self.styles['SectionHeader']))
        self._add_field(story, "Sequence Number", artifact.sequence_number)
        self._add_field(story, "Accession Number", artifact.accession_number)
        self._add_field(story, "Other Accession Number", artifact.other_accession_number)
        self._add_field(story, "On Display", "Yes" if artifact.on_display else "No")

        # Classification section
        story.append(Paragraph("Classification", self.styles['SectionHeader']))
        self._add_field(story, "Object Type", artifact.object_type)
        self._add_field(story, "Material", artifact.material)
        self._add_field(story, "Technique", artifact.technique)

        # Physical properties
        story.append(Paragraph("Physical Properties", self.styles['SectionHeader']))
        self._add_field(story, "Size/Dimensions", artifact.size_dimensions)
        self._add_field(story, "Weight", artifact.weight)

        # Description
        if artifact.description_catalogue or artifact.description_observation:
            story.append(Paragraph("Description", self.styles['SectionHeader']))
            if artifact.description_catalogue:
                self._add_field(story, "From Catalogue", artifact.description_catalogue)
            if artifact.description_observation:
                self._add_field(story, "Direct Observation", artifact.description_observation)

        # Historical data
        story.append(Paragraph("Historical Data", self.styles['SectionHeader']))
        self._add_field(story, "Inscription", artifact.inscription)
        self._add_field(story, "Findspot", artifact.findspot)
        self._add_field(story, "Production Place", artifact.production_place)
        self._add_field(story, "Chronology", artifact.chronology)

        # Additional info
        if artifact.bibliography or artifact.remarks:
            story.append(Paragraph("Additional Information", self.styles['SectionHeader']))
            self._add_field(story, "Bibliography", artifact.bibliography)
            self._add_field(story, "Remarks", artifact.remarks)

        story.append(PageBreak())

    def _add_field(self, story: list, label: str, value):
        """Add a labeled field to the PDF"""
        if value:
            story.append(Paragraph(label, self.styles['FieldLabel']))
            story.append(Paragraph(str(value), self.styles['FieldValue']))
