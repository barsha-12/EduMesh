import jsPDF from 'jspdf';
import { marked } from 'marked';

/**
 * Export study notes as PDF with cover page
 */
export const exportNotesPDF = (title, subject, content) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Page 1: Cover Page
    pdf.setFillColor(31, 115, 232); // Material Blue
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title on cover
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.text(title, margin, pageHeight / 2 - 30, { maxWidth: contentWidth, align: 'center' });

    // Subject on cover
    pdf.setFontSize(16);
    pdf.text(subject, margin, pageHeight / 2 + 10, { maxWidth: contentWidth, align: 'center' });

    // Date and footer on cover
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, pageHeight - 30, { maxWidth: contentWidth, align: 'center' });
    pdf.text('EduMesh Study Notes', margin, pageHeight - 20, { maxWidth: contentWidth, align: 'center' });

    // Page 2+: Content pages with markdown rendering
    let yPosition = margin;
    pdf.addPage();
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);

    // Parse markdown and render
    const tokens = marked.lexer(content);
    
    tokens.forEach((token) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      if (token.type === 'heading') {
        const headingSize = {
          1: 18,
          2: 14,
          3: 12,
        };
        pdf.setFontSize(headingSize[token.depth] || 12);
        pdf.setFont(undefined, 'bold');
        
        const text = token.text;
        const splitText = pdf.splitTextToSize(text, contentWidth);
        splitText.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 8;
        });

        yPosition += 4; // Extra space after heading
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(11);
      } else if (token.type === 'paragraph') {
        pdf.setFontSize(11);
        const text = token.text;
        const splitText = pdf.splitTextToSize(text, contentWidth);

        splitText.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });

        yPosition += 4; // Space between paragraphs
      } else if (token.type === 'list') {
        token.items.forEach((item) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          const bulletText = item.text;
          const splitText = pdf.splitTextToSize(`• ${bulletText}`, contentWidth - 10);

          splitText.forEach((line, index) => {
            if (index === 0) {
              pdf.text(line, margin + 5, yPosition);
            } else {
              pdf.text(line, margin + 10, yPosition);
            }
            yPosition += 6;
          });
        });
        yPosition += 4;
      } else if (token.type === 'code') {
        pdf.setFillColor(240, 240, 240);
        const codeLines = token.text.split('\n');
        
        codeLines.forEach((codeLine) => {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
          }

          const splitCode = pdf.splitTextToSize(codeLine || ' ', contentWidth - 4);
          splitCode.forEach((line) => {
            pdf.rect(margin, yPosition - 3, contentWidth, 6, 'F');
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'courier');
            pdf.text(line, margin + 2, yPosition);
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(11);
            yPosition += 6;
          });
        });
        yPosition += 4;
      }
    });

    // Add footer to all pages
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Download the PDF
    pdf.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    return { success: true, message: 'PDF exported successfully' };
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`Failed to export PDF: ${error.message}`);
  }
};

/**
 * Export quiz results as PDF
 */
export const exportQuizResultsPDF = (quizTitle, subject, score, total, answers, timestamp = new Date()) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Header
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Quiz Results', margin, 20);

    // Quiz details
    let yPos = 35;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');

    const detailsText = [
      `Quiz: ${quizTitle}`,
      `Subject: ${subject}`,
      `Date: ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`,
      `Score: ${score}/${total} (${Math.round((score / total) * 100)}%)`,
    ];

    detailsText.forEach((text) => {
      pdf.text(text, margin, yPos);
      yPos += 8;
    });

    // Score bar
    yPos += 5;
    const scorePercentage = (score / total) * 100;
    const scoreColor = scorePercentage >= 80 ? [76, 175, 80] : scorePercentage >= 60 ? [255, 193, 7] : [244, 67, 54];

    pdf.setFillColor(...scoreColor);
    pdf.rect(margin, yPos, (contentWidth * scorePercentage) / 100, 10, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPos, contentWidth, 10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(`${Math.round(scorePercentage)}%`, margin + contentWidth / 2, yPos + 7, { align: 'center' });

    // Answers section
    yPos += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text('Answers Review', margin, yPos);

    yPos += 12;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');

    answers.forEach((answer, index) => {
      if (yPos > pageHeight - margin - 20) {
        pdf.addPage();
        yPos = margin;
      }

      const isCorrect = answer.userAnswer === answer.correct;
      pdf.setTextColor(isCorrect ? 76 : 244, isCorrect ? 175 : 67, isCorrect ? 80 : 54);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Q${index + 1}. ${isCorrect ? '✓' : '✗'}`, margin, yPos);

      yPos += 6;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'normal');

      const questionText = pdf.splitTextToSize(`${answer.question}`, contentWidth - 10);
      questionText.forEach((line) => {
        if (yPos > pageHeight - margin - 10) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin + 5, yPos);
        yPos += 5;
      });

      pdf.setFont(undefined, 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Your answer: ${answer.userAnswer}`, margin + 5, yPos);
      yPos += 5;

      if (!isCorrect) {
        pdf.setTextColor(76, 175, 80);
        pdf.text(`Correct answer: ${answer.correct}`, margin + 5, yPos);
        yPos += 5;
      }

      yPos += 8;
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('EduMesh - Learn Better, Faster', margin, pageHeight - 10);
    }

    pdf.save(`quiz_results_${Date.now()}.pdf`);
    return { success: true, message: 'Quiz results exported successfully' };
  } catch (error) {
    console.error('Quiz PDF export error:', error);
    throw new Error(`Failed to export quiz results: ${error.message}`);
  }
};

/**
 * Export chat conversation as PDF
 */
export const exportChatPDF = (chatMessages, title = 'Chat Conversation') => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Header
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, margin, 15);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Exported: ${new Date().toLocaleString()}`, margin, 22);

    let yPos = 32;
    const lineHeight = 6;

    chatMessages.forEach((msg) => {
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      // Sender name and time
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(31, 115, 232); // Blue for AI, gray for user
      const senderColor = msg.role === 'user' ? [66, 133, 244] : [52, 168, 224];
      pdf.setTextColor(...senderColor);
      
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      pdf.text(`${msg.role.toUpperCase()}${timeStr ? ` - ${timeStr}` : ''}`, margin, yPos);
      yPos += 6;

      // Message content
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);

      const wrappedText = pdf.splitTextToSize(msg.content, contentWidth - 10);
      wrappedText.forEach((line) => {
        if (yPos > pageHeight - margin - 5) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin + 5, yPos);
        yPos += lineHeight;
      });

      yPos += 4; // Space between messages
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    pdf.save(`chat_${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    return { success: true, message: 'Chat exported as PDF successfully' };
  } catch (error) {
    console.error('Chat PDF export error:', error);
    throw new Error(`Failed to export chat: ${error.message}`);
  }
};
