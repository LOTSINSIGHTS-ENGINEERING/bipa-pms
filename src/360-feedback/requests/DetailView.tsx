import React from 'react';
import { Box, Typography, IconButton, Dialog, DialogContent } from '@mui/material';
import { ITemplateRating } from '../../../shared/models/three-sixty-feedback-models/TemplateRating';
import './DetailView.scss';
import { format } from 'date-fns';


interface DetailViewProps {
  open: boolean;
  onClose: () => void;
  data: ITemplateRating | null;
  getUserName: (userId: string) => string;
  getTemplateName: (templateId: string) => string;  
}

const DetailView: React.FC<DetailViewProps> = ({ open, onClose, data, getUserName, getTemplateName }) => {
  if (!data) return null;

  const formattedDate = format(new Date(data.dueDate), 'MM/dd/yyyy'); // Format date

  return (
    <Dialog open={open} onClose={onClose} className="detail-view-dialog" fullWidth maxWidth="md">
      <Box className="dialog-header">
        <Typography variant="h6" style={{ color: '#fff' }}>Detail View</Typography>
        <IconButton onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9.172 16.242 12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z"></path>
            <path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z"></path>
          </svg>
        </IconButton>
      </Box>
      <DialogContent>
        <Box className="detail-content">
          <Box className="detail-item">
            <Typography className="label">Ratee:</Typography>
            <Typography className="value">{getUserName(data.rateeId)}</Typography>
          </Box>
          <Box className="detail-item">
            <Typography className="label">Rater:</Typography>
            <Typography className="value">{getUserName(data.raterId)}</Typography>
          </Box>
          <Box className="detail-item">
            <Typography className="label">Due Date:</Typography>
            <Typography className="value">{formattedDate}</Typography>
          </Box>
          <Box className="detail-item">
            <Typography className="label">Reason:</Typography>
            <Typography className="value">{data.reasonForRequest}</Typography>
          </Box>
          <Box className="detail-item">
            <Typography className="label">Status:</Typography>
            <Typography className="value">{data.status}</Typography>
          </Box>
          <Box className="detail-item">
            <Typography className="label">Questionnaire:</Typography>
            <Typography className="value">{getTemplateName(data.templateId)}</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DetailView;