import React from 'react';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';

// Fix the jsPDF import - remove the destructuring and autotable
import jsPDF from 'jspdf';

export default function CandidateCard({ candidateData, onSelect, loadingCV }) {
  const name = candidateData?.full_name || 'Unknown Name';
  const title = candidateData?.job_title || '';
  const location = candidateData?.location_name || '';
  const country = candidateData?.location_country || '';
  const industry = candidateData?.industry || '';
  const company = candidateData?.job_company_name || '';
  const email = candidateData?.emails?.[0]?.address || candidateData?.work_email || '';
  const phone = candidateData?.phone_numbers?.[0] || '';
  const salary = candidateData?.inferred_salary || '';
  const yearsExperience =
    candidateData?.yearsExperience ?? candidateData?.inferred_years_experience;
  const skills = Array.isArray(candidateData?.skills)
    ? candidateData.skills.filter((s) => s.trim() !== '')
    : [];
  const summary = candidateData?.cv_metadata?.summary || candidateData?.summary || '';
  const education = Array.isArray(candidateData?.education) ? candidateData.education : [];
  const experience = Array.isArray(candidateData?.experience) ? candidateData.experience : [];
  const profiles = candidateData?.social_media || candidateData?.profiles || [];
  const cvUrl = candidateData?.cvUrl || '';

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '';
  const linkedinProfile = profiles.find((p) => p.network?.toLowerCase() === 'linkedin');
  const facebookProfile = profiles.find((p) => p.network?.toLowerCase() === 'facebook');

  const maxSkills = 7;
  const displayedSkills = skills.slice(0, maxSkills);
  const remainingSkillsCount = skills.length - maxSkills;

  // Enhanced education data check
  const hasEducationData =
    education.length > 0 &&
    education.some(
      (edu) =>
        (Array.isArray(edu.degrees) &&
          edu.degrees.length > 0 &&
          edu.degrees.some((d) => d && d.trim() !== '')) ||
        (edu.degree && edu.degree.trim() !== '') ||
        (Array.isArray(edu.majors) &&
          edu.majors.length > 0 &&
          edu.majors.some((m) => m && m.trim() !== '')) ||
        (edu.major && edu.major.trim() !== '') ||
        (edu.institution && edu.institution.trim() !== '') ||
        (edu.dates && edu.dates.trim() !== '')
    );

  const generatePDF = () => {
    try {
      console.log('Starting PDF generation...'); // Debug log

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let y = 25;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // Two-column layout
      const leftColumnWidth = (contentWidth - 10) / 2; // Left column
      const rightColumnWidth = (contentWidth - 10) / 2; // Right column
      const rightColumnX = margin + leftColumnWidth + 10; // Right column X position

      // Simplified color scheme - mainly black and gray
      const textColor = [0, 0, 0]; // Black
      const grayColor = [100, 100, 100]; // Gray
      const lightGray = [220, 220, 220]; // Light gray for lines

      // Helper function to ensure text is a string
      const safeText = (text) => {
        if (typeof text === 'string') return text;
        if (text === null || text === undefined) return '';
        if (typeof text === 'object') {
          if (text.name) return String(text.name);
          if (text.title) return String(text.title);
          if (text.value) return String(text.value);
          if (text.text) return String(text.text);
          return '';
        }
        return String(text);
      };

      // HEADER - Full width
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(safeText(name).toUpperCase(), margin, y);
      y += 10;

      // Job Title - Full width
      if (title) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(safeText(title), margin, y);
        y += 8;
      }

      // Company - Full width
      if (company) {
        doc.setFontSize(12);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(safeText(company), margin, y);
        y += 15;
      }

      // Contact Information - Right aligned
      const contactStartY = 25;
      let contactY = contactStartY;
      const contactX = pageWidth - margin - 70;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      if (email) {
        doc.text(safeText(`Email: ${email}`), contactX, contactY);
        contactY += 6;
      }
      if (phone) {
        doc.text(safeText(`Phone: ${phone}`), contactX, contactY);
        contactY += 6;
      }
      if (location || country) {
        const locationText =
          `${safeText(location)} ${country ? `, ${safeText(country)}` : ''}`.trim();
        doc.text(safeText(locationText), contactX, contactY);
        contactY += 6;
      }

      // Full width line separator
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Helper function for section headers
      const createSectionHeader = (title, xPos, yPos, width) => {
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(safeText(title), xPos, yPos);

        const textWidth = doc.getTextWidth(safeText(title));
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(xPos, yPos + 2, xPos + textWidth, yPos + 2);

        return yPos + 12;
      };

      // Start two-column layout
      let leftY = y;
      let rightY = y;

      // LEFT COLUMN

      // PROFESSIONAL SUMMARY - Left column
      if (summary) {
        leftY = createSectionHeader('PROFESSIONAL SUMMARY', margin, leftY, leftColumnWidth);

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(safeText(summary), leftColumnWidth);
        doc.text(summaryLines, margin, leftY);
        leftY += summaryLines.length * 5 + 15;
      }

      // CORE COMPETENCIES/SKILLS - Left column
      if (skills.length > 0) {
        leftY = createSectionHeader('Skills', margin, leftY, leftColumnWidth);

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const skillsText = skills.map((skill) => safeText(skill)).join(', ');
        const skillsLines = doc.splitTextToSize(skillsText, leftColumnWidth);
        doc.text(skillsLines, margin, leftY);
        leftY += skillsLines.length * 5 + 15;
      }

      // EDUCATION - Left column
      if (hasEducationData) {
        leftY = createSectionHeader('EDUCATION', margin, leftY, leftColumnWidth);

        education.forEach((edu) => {
          const degree = Array.isArray(edu.degrees)
            ? edu.degrees
                .filter((d) => d && safeText(d).trim() !== '')
                .map((d) => safeText(d))
                .join(', ')
            : edu.degree && safeText(edu.degree).trim() !== ''
              ? safeText(edu.degree)
              : '';
          const major = Array.isArray(edu.majors)
            ? edu.majors
                .filter((m) => m && safeText(m).trim() !== '')
                .map((m) => safeText(m))
                .join(', ')
            : edu.major && safeText(edu.major).trim() !== ''
              ? safeText(edu.major)
              : '';
          const institution = safeText(edu.institution || edu.school?.name || '');

          if (degree || major || institution) {
            // Institution name
            if (institution) {
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
              const instLines = doc.splitTextToSize(institution, leftColumnWidth);
              doc.text(instLines, margin, leftY);
              leftY += instLines.length * 6 + 1;
            }

            // Degree and major
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const eduText = `${degree}${major ? ` in ${major}` : ''}`;
            if (eduText.trim()) {
              const eduLines = doc.splitTextToSize(safeText(eduText), leftColumnWidth);
              doc.text(eduLines, margin, leftY);
              leftY += eduLines.length * 5 + 1;
            }

            // Dates
            if (edu.dates || (edu.start_date && edu.end_date)) {
              doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
              doc.setFontSize(9);
              const dates = edu.dates || `${safeText(edu.start_date)} - ${safeText(edu.end_date)}`;
              doc.text(safeText(dates), margin, leftY);
              leftY += 6;
              doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            }

            leftY += 8; // Space between education entries
          }
        });
        leftY += 10;
      }

      // RIGHT COLUMN

      // PROFESSIONAL EXPERIENCE - Right column
      if (experience && experience.length > 0) {
        rightY = createSectionHeader(
          'PROFESSIONAL EXPERIENCE',
          rightColumnX,
          rightY,
          rightColumnWidth
        );

        experience.forEach((exp) => {
          // Check if we need more space
          if (rightY > pageHeight - 80) {
            doc.addPage();
            rightY = 30;
            rightY = createSectionHeader(
              'PROFESSIONAL EXPERIENCE (cont.)',
              rightColumnX,
              rightY,
              rightColumnWidth
            );
          }

          // Job Title
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const jobTitle = safeText(
            exp.title || exp.job_title || exp.position || exp.role || 'Position'
          );
          const titleLines = doc.splitTextToSize(jobTitle, rightColumnWidth);
          doc.text(titleLines, rightColumnX, rightY);
          rightY += titleLines.length * 6 + 1;

          // Company
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const companyName = safeText(
            exp.company || exp.company_name || exp.employer || exp.organization || 'Company'
          );
          const companyLines = doc.splitTextToSize(companyName, rightColumnWidth);
          doc.text(companyLines, rightColumnX, rightY);
          rightY += companyLines.length * 5 + 1;

          // Duration
          doc.setFontSize(9);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

          let startDate = '';
          let endDate = '';

          if (exp.start_date) {
            startDate = safeText(exp.start_date);
          } else if (exp.dates && exp.dates.start) {
            startDate = safeText(exp.dates.start);
          } else if (exp.period && exp.period.start) {
            startDate = safeText(exp.period.start);
          }

          if (exp.end_date) {
            endDate = safeText(exp.end_date);
          } else if (exp.dates && exp.dates.end) {
            endDate = safeText(exp.dates.end);
          } else if (exp.period && exp.period.end) {
            endDate = safeText(exp.period.end);
          } else {
            endDate = 'Present';
          }

          if (startDate) {
            doc.text(`${startDate} - ${endDate}`, rightColumnX, rightY);
            rightY += 6;
          }

          // Description
          const description =
            exp.description || exp.summary || exp.details || exp.responsibilities || '';
          if (description) {
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(9);
            const descText = safeText(description);
            const descLines = doc.splitTextToSize(descText, rightColumnWidth);
            doc.text(descLines, rightColumnX, rightY);
            rightY += descLines.length * 4 + 5;
          }

          rightY += 10; // Space between experience entries
        });
      }

      // PROFESSIONAL PROFILES - Right column (if space available)
      if (profiles.length > 0) {
        // Add some space
        rightY += 10;

        if (rightY < pageHeight - 60) {
          rightY = createSectionHeader(
            'PROFESSIONAL PROFILES',
            rightColumnX,
            rightY,
            rightColumnWidth
          );

          profiles.forEach((profile) => {
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            const networkText = safeText(profile.network || 'Unknown');
            const urlText = safeText(profile.url || '');
            const profileText = `${networkText}: ${urlText}`;
            const profileLines = doc.splitTextToSize(profileText, rightColumnWidth);
            doc.text(profileLines, rightColumnX, rightY);
            rightY += profileLines.length * 4 + 3;
          });
        }
      }

      // Footer - Full width
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.setFontSize(8);
      doc.text('Generated by CVFlow', margin, pageHeight - 10);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 30, pageHeight - 10);

      console.log('PDF generated successfully'); // Debug log

      // Open PDF in new window
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  return (
    <Card
      sx={{
        height: { xs: 'auto', sm: 320 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        p: 2,
        width: 870,
        gap: 2,
      }}
    >
      {/* Left Panel */}
      <Stack
        spacing={1}
        sx={{
          width: { xs: '100%', sm: 220 },
          flexShrink: 0,
          pr: { sm: 2 },
          borderRight: { sm: '1px solid #eee' },
          height: { xs: 'auto', sm: '100%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mx: 'auto' }}>
            {initials}
          </Avatar>
          <Typography variant="h6">{name}</Typography>
          {title && (
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          )}
          {(location || country) && (
            <Typography variant="body2" color="text.secondary">
              {location} {country && `(${country})`}
            </Typography>
          )}
          {industry && (
            <Typography variant="body2" color="text.secondary">
              {industry}
            </Typography>
          )}
          {typeof yearsExperience === 'number' && (
            <Typography variant="body2" color="text.secondary">
              {yearsExperience} years experience
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          {linkedinProfile?.url && (
            <Tooltip title="LinkedIn">
              <IconButton
                href={
                  linkedinProfile.url.startsWith('http')
                    ? linkedinProfile.url
                    : `https://${linkedinProfile.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <LinkedInIcon sx={{ color: '#00eeff' }} />
              </IconButton>
            </Tooltip>
          )}
          {facebookProfile?.url && (
            <Tooltip title="Facebook">
              <IconButton
                href={
                  facebookProfile.url.startsWith('http')
                    ? facebookProfile.url
                    : `https://${facebookProfile.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <FacebookIcon sx={{ color: '#4267B2' }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Right Panel */}
      <CardContent
        sx={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: { xs: 'auto', sm: '100%' },
          position: 'relative',
        }}
      >
        {/* Summary Section */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Summary
        </Typography>
        {summary ? (
          <Typography variant="body2" paragraph>
            {summary}
          </Typography>
        ) : (
          <Typography variant="body2" paragraph color="text.secondary">
            No available information.
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />

        {/* Skills Section */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Skills
        </Typography>
        {skills.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
            {displayedSkills.map((skill, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{ bgcolor: 'primary.main', borderRadius: 1, px: 1, py: 0.5 }}
              >
                {skill}
              </Typography>
            ))}
            {remainingSkillsCount > 0 && (
              <Typography
                variant="body2"
                sx={{ bgcolor: 'grey.500', borderRadius: 1, px: 1, py: 0.5, color: 'white' }}
              >
                +{remainingSkillsCount}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" paragraph color="text.secondary">
            No available information.
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />

        {/* Education Section */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Education
        </Typography>
        {hasEducationData ? (
          education.map((edu, idx) => {
            const degree = Array.isArray(edu.degrees)
              ? edu.degrees.filter((d) => d && d.trim() !== '').join(', ')
              : edu.degree && edu.degree.trim() !== ''
                ? edu.degree
                : '';
            const major = Array.isArray(edu.majors)
              ? edu.majors.filter((m) => m && m.trim() !== '').join(', ')
              : edu.major && edu.major.trim() !== ''
                ? edu.major
                : '';

            const educationText =
              `${degree} ${major ? `- ${major}` : ''} ${edu.institution ? `(${edu.institution})` : ''}`.trim();

            return (
              <div key={idx}>
                {educationText && (
                  <Typography variant="body2" gutterBottom>
                    {educationText}
                  </Typography>
                )}
                {edu.dates && edu.dates.trim() !== '' && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {edu.dates}
                  </Typography>
                )}
              </div>
            );
          })
        ) : (
          <Typography variant="body2" paragraph color="text.secondary">
            No available information.
          </Typography>
        )}
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              gap: 1,
              p: '4px 6px',
              borderRadius: '8px',
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <Button variant="outlined" href={cvUrl} target="_blank" size="small" onClick={onSelect}>
              View CV
            </Button>
            <Button variant="contained" size="small" onClick={generatePDF}>
              Download CV
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
