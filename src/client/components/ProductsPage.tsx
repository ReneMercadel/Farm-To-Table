// React Imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/system';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Navigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';

// Component Imports
import ProductsContainer from './ProductsContainer';
// can import getallproducts after migrating it to apicalls file
import { updateProduct } from '../apiCalls/productCallS';
// import { cli } from 'webpack';

const ProductsPage = () => {
  const [updateCounter, setUpdateCounter] = useState(0);

  // cerate state var Products array (set to result of get req)
  const [products, setProducts] = useState([]);

  // create a stateful boolean to monitor if updating existing product (in update mode) or creating a new product entry
  const [inEditMode, setInEditMode] = useState(false);

  // create state var for product object
  const [product, setProduct] = useState({
    id: 0,
    img_url: '',
    name: '',
    description: '',
    plant_date: '',
    harvest_date: '',
    subscription_id: '',
  });
  // state var for backdrop
  const [open, setOpen] = useState(false);

  // handle create form
  const handleCreateForm = () => {
    setOpen(true);
  };

  // Handlers for backdrop control
  const handleClose = () => {
    setOpen(false);
    setInEditMode(false);
    setProduct({
      id: 0,
      img_url: '',
      name: '',
      description: '',
      plant_date: '',
      harvest_date: '',
      subscription_id: '',
    });
  };
  // const handleToggle = () => {
  // };

  // Box component styles
  const commonStyles = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    // to center elements absolutely inside parent
    // add event listener to window size to resize only when certain size bounds are crossed
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 1,
    padding: '20px',
    borderRadius: '2.5rem',
    boxShadow: 24,

    // width: ,
    // minWidth: 500,
    // minHeight: 500,
    // maxWidth: 1800,
    // maxHeight: 1800,
    // display: 'flex',
  };

  // Destructure product state obj
  const {
    img_url,
    name,
    description,
    plant_date,
    harvest_date,
    subscription_id,
  } = product;

  // create post req to send product form data
  const postProduct = (e: any) => {
    console.log('LINE 108');
    e.preventDefault();
    axios
      .post('/api/product', {
        product: {
          name: name,
          description: description,
          img_url: img_url,
          plant_date: plant_date,
          harvest_date: harvest_date,
          subscription_id: Number(subscription_id),
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((data) => {
        console.log('saved!', data);
        setUpdateCounter(updateCounter + 1);
        handleClose();
        // <Navigate to='/admin/edit-products' />; // ???
      })
      .catch((err) => console.error(err));
  };

  // create function to handle update form submission
  const handleProductUpdateSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // call async function that was imported from apiCalls/productCalls
      const result = await updateProduct(product.id, product);
      // keep in try so it doesn't rerender on error
      setUpdateCounter(updateCounter + 1);
      handleClose();

      console.log('LINE 130 || PRODUCTS PAGE', result);
    } catch (err) {
      console.error('LINE 132 || PRODUCTS PAGE ', err);
    }
  };

  // Create input handler for form text
  const handelTextInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((state) => {
      return {
        ...state,
        [name]: value,
      };
    });
  };

  ///////////////////////////////////////////////// CONSOLIDATE ALL CLOUDINARY HANDLING
  // Cloudinary handling
  // console.log(process.env.CLOUD_PRESET2);
  const CLOUD_NAME = process.env.CLOUD_NAME;
  const CLOUD_PRESET2 = process.env.CLOUD_PRESET2;
  const showWidget = () => {
    console.log('LINE 115 || CLOUDINARY');
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: CLOUD_PRESET2,
        folder: name,
        // WE NEED TO CONSIDER ADDING A 2 DIGIT YEAR NUMBER AT THE END OF EACH SEASON TO IDENTIFY
        // AND ACCESS PHOTOS MORE EASILY
        tags: [subscription_id],
      },
      (error: any, result: { event: string; info: { url: string } }) => {
        if (!error && result && result.event === 'success') {
          console.log('LINE 56', result.info.url);
          setProduct((state) => {
            return {
              ...state,
              img_url: result.info.url,
            };
          });
          console.log('LINE 63', result.info.url);
        }
        console.log('LINE 135 || CLOUDINARY', error);
      }
    );
    widget.open();
  };

  // get all products handler
  const getAllProducts = () => {
    axios
      .get('/get_all_products')
      .then((data) => {
        console.log('LINE 165 || GET ALL PRODUCTS', data);
        // set products state to allProducts array
        setProducts(data.data);
      })
      .catch((err) => {
        console.error('LINE 170 || GET ALL PRODUCTS ERROR');
      });
  };

  // handle click + edit form functionality for edit button in Product Card component
  const handleEditClick = (productId: any) => {
    console.log('LINE 185 || PRODUCTS PAGE CLICKED', productId);

    const clickedProduct: any = products.find(
      // find mutates original array values
      (prod: any) => prod.id === productId
    );
    clickedProduct.img_url = clickedProduct.img_url
      ? clickedProduct.img_url
      : 'http://res.cloudinary.com/ddg1jsejq/image/upload/v1651189122/dpzvzkarpu8vjpwjsabd.jpg';
    // delete clickedProduct.updatedAt;
    // delete clickedProduct.createdAt;
    // delete clickedProduct.id;

    setProduct({
      id: productId,
      img_url: clickedProduct.img_url,
      name: clickedProduct.name,
      description: clickedProduct.description,
      plant_date: clickedProduct.plant_date,
      harvest_date: clickedProduct.harvest_date,
      subscription_id: clickedProduct.subscription_id,
    });
    setInEditMode(true);
    setOpen(true);
  };

  // useEffect((): void => {
  //   // don't prevent default here so it gets on page load and all state updates?
  //   getAllProducts();
  // }, [products]);
  useEffect((): void => {
    getAllProducts();
  }, [updateCounter]);

  return (
    <div>
      <ProductsContainer
        products={products}
        getAllProducts={getAllProducts}
        handleEditClick={handleEditClick}
        inEditMode={inEditMode}
      />
      {/* <Button onClick={handleToggle}>Show backdrop</Button> */}
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '2.5rem',
          boxShadow: 24,
        }}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 750,
        }}
        className='add_x_form_modal'
      >
        <Fade in={open}>
          {
            <div>
              <div>
                <Box
                  sx={{
                    ...commonStyles,
                    // flexWrap: 'wrap',
                    // display: 'flex',
                    // justifyContent: 'center',
                    // borderRadius: '16px',
                  }}
                >
                  <form
                    onSubmit={
                      inEditMode ? handleProductUpdateSubmit : postProduct
                    }
                  >
                    <Button
                      variant='contained'
                      size='large'
                      onClick={showWidget}
                    >
                      Add Product Image
                    </Button>
                    <br></br>
                    {img_url && <img width={300} src={img_url} />}
                    <br></br>
                    <FormControl fullWidth sx={{ m: 1 }} variant='standard'>
                      <InputLabel htmlFor='standard-adornment-amount'>
                        Amount
                      </InputLabel>
                      <Input
                        name='name'
                        value={name}
                        id='Product Name'
                        // id='fullWidth'
                        placeholder='Avocado'
                        onChange={handelTextInput}
                        startAdornment={
                          <InputAdornment position='start'>$</InputAdornment>
                        }
                      />
                    </FormControl>
                    <TextField
                      // width='75%'
                      // type={{ width: '75%' }}
                      id='filled-basic'
                      variant='filled'
                      // label='Filled'
                      value={name}
                      name='name'
                      label='Product Name'
                      // id='fullWidth'
                      placeholder='Avocado'
                      onChange={handelTextInput}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      fullWidth
                      id='filled-basic'
                      variant='filled'
                      value={description}
                      name='description'
                      label='Product Description'
                      // id='fullWidth'
                      placeholder='Description'
                      onChange={handelTextInput}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      fullWidth
                      id='filled-basic'
                      variant='filled'
                      value={plant_date}
                      name='plant_date'
                      label='Plant Date'
                      // id='fullWidth'
                      placeholder='Plant Date'
                      onChange={handelTextInput}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      fullWidth
                      id='filled-basic'
                      variant='filled'
                      value={harvest_date}
                      name='harvest_date'
                      label='Harvest Date'
                      // id='fullWidth'
                      placeholder='Projected Harvest Date'
                      onChange={handelTextInput}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      fullWidth
                      id='filled-basic'
                      variant='filled'
                      value={subscription_id}
                      name='subscription_id'
                      label='Season'
                      // id='fullWidth'
                      placeholder='Season'
                      onChange={handelTextInput}
                    />
                    <br></br>
                    <br></br>
                    <Button variant='contained' size='large' type='submit'>
                      {inEditMode ? 'UPDATE' : 'SAVE'}
                    </Button>
                    <br></br>
                    <br></br>
                    {/* <button type='submit' className='form--submit'>
                Save Product
              </button> */}
                  </form>
                </Box>
              </div>
            </div>
          }
        </Fade>
      </Modal>
      <Fab
        onClick={handleCreateForm}
        size='small'
        // color='secondary'
        aria-label='add'
        style={{ transform: 'scale(2.5)', backgroundColor: '#80D55F' }}
        sx={{
          position: 'fixed',
          bottom: (theme) => theme.spacing(8),
          right: (theme) => theme.spacing(8),
        }}
      >
        <AddIcon style={{ color: '#FFFFFF' }} />
      </Fab>
    </div>
  );
};

export default ProductsPage;
