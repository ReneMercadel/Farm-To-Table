/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../App';

// MUI IMPORTS
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  IconButtonProps,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { red } from '@mui/material/colors';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

// PASS EXPANDMORE THROUGH PROPS FROM PARENT: ALSO USED IN product CARD COMPONENT
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const SubscriptionCard = ({
  sub,
  handleEditClick,
  handleAddressForm,
  subscription,
  subscriptions,
  getAllSubscriptions,
  deleteSubscription,
}: any) => {
  const user: any = useContext(UserContext);
  const { roleId } = user;

  // expanded state var
  const [expanded, setExpanded] = useState(false);

  // toggle bool
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const {
    id,
    season,
    year,
    description,
    flat_price,
    weekly_price,
    start_date,
    end_date,
    thumbnail,
  } = sub;

  return (
    <div>
      <Card sx={{ minWidth: 250, borderRadius: '2.5rem', boxShadow: 24 }}>
        <CardHeader
          subheader={`Harvest Year ${year}`}
          // NEED TO FIGURE OUT HOW TO MATCH productS TO WEEKS
          title={season}
        />
        <CardMedia
          component='img'
          height='194'
          image={
            thumbnail
              ? thumbnail
              : 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.sloveg.com%2Ffresh-spring-harvest%2F&psig=AOvVaw0YMqaUPyUqS39AwMZlEsSp&ust=1651508751266000&source=images&cd=vfe&ved=0CAwQjRxqFwoTCKCr9dfbvvcCFQAAAAAdAAAAABAD'
          }
        />
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {`Flat Price: $${flat_price}`}
          </Typography>
        </CardContent>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {`Weekly Price: $${weekly_price}`}
          </Typography>
        </CardContent>

        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {`Start Date: ${start_date}`}
          </Typography>
        </CardContent>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            {`End Date: ${end_date}`}
          </Typography>
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'center' }}>
          <Stack spacing={5} direction='row' id='product_card_stack'>
            {roleId > 3 && (
              <ExpandMore
                sx={{ color: 'green' }}
                expand={expanded}
                onClick={() => deleteSubscription(id)}
              >
                <DeleteIcon sx={{ color: 'green' }} />
              </ExpandMore>
            )}
            {roleId > 3 && (
              <ExpandMore
                sx={{ color: 'green' }}
                expand={expanded}
                onClick={() => handleEditClick(id)}
              >
                <EditIcon sx={{ color: 'green' }} />
              </ExpandMore>
            )}
            <ExpandMore
              sx={{ color: 'green' }}
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label='show more'
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Stack>
          {roleId < 4 && (
            <Button
              variant='text'
              size='small'
              // type='submit'
              sx={{ color: 'green' }}
              onClick={() => handleAddressForm(id)}
            >
              SUBSCRIBE
            </Button>
          )}
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardContent>
            {/* // setup map that returns all product info */}
            <Typography variant='body2' color='text.secondary'>
              {`Inside Your Order: ${description}`}
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </div>
  );
};

export default SubscriptionCard;
