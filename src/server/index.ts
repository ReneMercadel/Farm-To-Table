/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

// Import Dependencies
import express, { Express, Request, Response } from 'express';
//import dotenv from "dotenv";
require('dotenv').config();
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const axios = require('axios');
// require Op object from sequelize to modify where clause in options object
const { Op } = require('sequelize');

// Import database and models
require('./db/database.ts');
require('./middleware/auth');
import {
  Farms,
  Roles,
  Orders,
  DeliveryZones,
  Products,
  RSVP,
  Subscriptions,
  Users,
  Vendors,
  SubscriptionEntries,
  DietaryRestrictions,
  Events,
} from './db/models';
const authRouter = require('./routes/AuthRouter');
const eventRouter = require('./routes/EventRouter');
// const subscriptionRouter = require('./routes/SubscriptionsRouter')
// const farmRouter = require('./routes/FarmRouter')
import UserInterface from '../types/UserInterface';
import Profile from 'src/client/components/ProfilePage';
//import { postEvent } from "./routes/EventRoutes";

// // Needs to stay until used elsewhere (initializing models)
// console.log(Farms, Roles, Events, Orders, DeliveryZones,Products, RSVP, Subscriptions, Users, Vendors);

//dotenv.config();

const app: Express = express();
const port = process.env.LOCAL_PORT;

const dist = path.resolve(__dirname, '..', '..', 'dist');
// console.log('LINE 37 || INDEX.TSX', __dirname);

app.use(express.json());
app.use(express.static(dist));
app.use(express.urlencoded({ extended: true }));

// Stripe Setup
const stripe = require('stripe')(process.env.STRIPE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 10000, name: 'Season Subscription' }],
  [2, { priceInCents: 20000, name: 'Annual Subscription' }],
]);
//routes
app.use('/auth', authRouter);
app.use('/events', eventRouter);
// app.use('/subscriptions', subscriptionRouter);
// app.use('/', farmRouter)

// // Middleware
// const isAdmin = (req: { user: { role_id: number } }, res: any, next: any) => {
//   if (!req.user || req.user.role_id !== 4) {
//     // res.redirect('/'); // Whats is the use case?
//     res.status(404); // What is the use case?
//   } else {
//     next();
//   }
// };

// Create a post request for /create-checkout-session
app.post('/create-checkout-session', async (req, res) => {
  try {
    res.json({ url: '/orders-page' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}),
  ////////SUBSCRIPTION REQUEST////////////

  ///////////////////////////////////////////////////////////////////////////////////////////// POST PRODUCT ROUTE
  app.post('/api/product', (req: Request, res: Response) => {
    const {
      img_url,
      name,
      description,
      plant_date,
      harvest_date,
      subscription_id,
    } = req.body.product;

    console.log('162 Request object postEvent', req.body);
    Products.create({
      name,
      description,
      img_url,
      plant_date,
      harvest_date,
      subscription_id,
    })
      .then((data: any) => {
        console.log('LINE 187 || Product Post Request', data);
        res.status(201).json(data);
      })
      .catch((err: string) => {
        console.error('Product Post Request Failed', err);
        res.status(500).json(err);
      });
  });

///////////////////////////////////////////////////////////////////////////////////////////// POST PRODUCT ROUTE
app.patch('/api/product/:id', async (req: Request, res: Response) => {
  console.log('LINE 271 || UPDATE PRODUCT', req.body);

  try {
    // update product model with async query and assign the result of that promise to a variable to res.send back
    const updatedProduct = await Products.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    console.log('LINE 278 || UPDATE PRODUCT', updatedProduct);

    res.status(204).json(updatedProduct);
  } catch (err) {
    console.error('LINE 274 || UPDATE PRODUCTS', err);
    res.status(500).json(err);
  }
});

//////////////////////////////////////////////////////////////////////////////////////////// GET ALL PRODUCT ROUTE
app.get('/get_all_products', (req: Request, res: Response) => {
  // findAll products in the current season for users. find ALL products (organized by season) for admin
  // NEED TO GIVE ALL SEASONS A CURRENT SEASON BOOLEAN. WILL MAKE REQUEST EASIER??
  // CHECK SEASON START DATE PROPERTY

  // IMPLEMENTING SIMPLE GETALL REQUEST FOR MVP
  Products.findAll({ where: {} })
    .then((data: any) => {
      // console.log('LINE 293 || INDEX GET ALL PRODUCTS', data);
      res.json(data);
    })
    .catch((err: any) => {
      console.error('LINE 297 || INDEX GET ALL PRODUCTS ERROR', err);
    });
});

///////////////////////////////////////////////////////////////////////////////////////////// ORDERS GET ROUTE
app.get(`/api/upcoming_orders/:id`, (req: Request, res: Response) => {
  // console.log('LINE 238 || SERVER INDEX', req.params); // user id
  // NEED TO QUERY BETWEEN USER TABLE AND SUBSCRIPTION ENTRY TABLE
  // QUERY USER TABLE THEN JOIN
  SubscriptionEntries.findAll({ where: { user_id: req.params.id } })
    .then((data: Array<object>) => {
      const dataObj: Array<object> = [];
      console.log(
        'LINE 253',
        data.forEach((subscriptionEntry: any) => {
          // console.log('LINE 255', subscriptionEntry.dataValues);
          if (subscriptionEntry.dataValues.user_id === Number(req.params.id)) {
            dataObj.push(subscriptionEntry.dataValues.id);
          }
        })
      );
      console.log(
        'LINE 261',
        dataObj.map((subscriptionEntryId: any) => {
          return { subscription_entry_id: subscriptionEntryId };
        })
      );
      // Orders.findAll({ where: { subscription_entry_id: req.params.id } })
      Orders.findAll({
        where: {
          [Op.or]: dataObj.map((subscriptionEntryId: any) => ({
            subscription_entry_id: subscriptionEntryId,
          })),
        },
      })
        .then((data: any) => {
          // console.log('LINE 241 || SERVER INDEX', Array.isArray(data)); // ==> ARRAY OF ORDER OBJECTS
          res.json(data);
        })
        .catch((err: any) => {
          console.error('LINE 244 || SERVER INDEX', err);
          res.send(err);
        });
    })
    .catch((err: any) => {
      console.error('LINE 254', err);
    });

  // console.log('LINE 263 ||', dataObj);
});

////////////////////////////////////////////////////////////////////////////// SUBSCRIPTION REQUESTS ////////////
app.put(`/api/subscribed/:id`, (req: Request, res: Response) => {
  Users.update(req.body, { where: { id: req.params.id }, returning: true })
    .then((response: any) => {
      // console.log('Subscription Route', response[1]);
      // res.redirect(
      //   200,
      //   'https://localhost:5555/subscriptions-page/confirmation-page'
      // );
      res.send(203);
    })
    .catch((err: unknown) => {
      console.error('SUBSCRIPTION ROUTES:', err);
    });
});

app.post(
  `/api/add_subscription_entry/:id`,
  async (req: Request, res: Response) => {
    // console.log('LINE 200 || SERVER INDEX.TS', req.body);

    const addSubscription = (id: number) => {
      SubscriptionEntries.create({
        user_id: req.params.id,
        farm_id: 1,
        subscription_id: id,
      })
        .then((data: any) => {
          // console.log('LINE 196 || SERVER ||', data.dataValues.id);

          const today: Date = new Date();
          // iterate over number of orders
          for (let i = 1; i < 15; i++) {
            const nextWeek = () => {
              const today = new Date();
              const nextwk = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 7 * i
              );
              return nextwk;
            };
            // console.log('LINE 218 || NEXTWEEK', nextWeek());
            Orders.create({
              // subscription_id: data.dataValues.subscription_id,
              subscription_entry_id: data.dataValues.id,
              delivery_date: nextWeek(),
              farm_id: 1,
            })
              .then((data: any) => {
                // console.log('LINE 224 || SERVER INDEX ||', data);
              })
              .catch((err: any) => {
                console.log('LINE 228 || SERVER INDEX || ERROR', err);
              });
          }
        })
        .catch((err: any) => {
          console.error(err);
        });
    };
    try {
      if (req.body.season === 'whole year') {
        await addSubscription(1);
        await addSubscription(2);
        res.status(201).send('Subscribed!');
      } else {
        const subscription_id = req.body.season === 'fall' ? 2 : 1;
        await addSubscription(subscription_id);
        res.status(201).send('Subscribed!');
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

app.get(`/api/subscriptions/`, (req: Request, res: Response) => {
  Subscriptions.findAll()
    .then((data: any) => {
      res.status(200).send(data);
    })
    .catch((err: any) => {
      console.error('Subscription Route ERROR', err);
    });
});

//////////////////////////////////////////////////////////////Subscription ADMIN Creation/Edit/Delete Routes//

app.post('/api/subscriptions-admin', (req: Request, res: Response) => {
  // console.log('LINE 272 ****', req.body.event);
  const {
    season,
    year,
    flat_price,
    weekly_price,
    description,
    start_date,
    end_date,
  } = req.body.event;

  console.log('283 Request object postSubscription', req.body);
  Subscriptions.create({
    season,
    year,
    flat_price,
    weekly_price,
    description,
    start_date,
    end_date,
    farm_id: 1,
  })
    .then((data: any) => {
      console.log('294 Return Subscriptions Route || Post Request', data);
      res.status(201);
    })
    .catch((err: string) => {
      console.error('Post Request Failed', err);
      res.sendStatus(500);
    });
});

app.get('/api/farms', (req: Request, res: Response) => {
  Farms.findAll()
    .then((data: any) => {
      // console.log("this is the data from the farm api call", data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});

//ADMIN RECORDS ROUTES

app.get('/records/deliveryZones', (req: Request, res: Response) => {
  DeliveryZones.findAll()
    .then((data: any) => {
      console.log('delivery data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/dietaryRestrictions', (req: Request, res: Response) => {
  DietaryRestrictions.findAll()
    .then((data: any) => {
      console.log('DietaryRestrictions data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/events', (req: Request, res: Response) => {
  Events.findAll()
    .then((data: any) => {
      console.log('Events data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/farms', (req: Request, res: Response) => {
  Farms.findAll()
    .then((data: any) => {
      console.log('Farms data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/orders', (req: Request, res: Response) => {
  Orders.findAll()
    .then((data: any) => {
      console.log('Orders data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/products', (req: Request, res: Response) => {
  Products.findAll()
    .then((data: any) => {
      console.log('Products data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/roles', (req: Request, res: Response) => {
  Roles.findAll()
    .then((data: any) => {
      console.log('Roles data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/rsvps', (req: Request, res: Response) => {
  RSVP.findAll()
    .then((data: any) => {
      console.log('RSVP data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/subscriptionEntries', (req: Request, res: Response) => {
  SubscriptionEntries.findAll()
    .then((data: any) => {
      console.log('SubscriptionEntries data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/subscriptions', (req: Request, res: Response) => {
  Subscriptions.findAll()
    .then((data: any) => {
      console.log('Subscriptions data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/users', (req: Request, res: Response) => {
  Users.findAll()
    .then((data: any) => {
      console.log('Users data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});
app.get('/records/vendors', (req: Request, res: Response) => {
  Vendors.findAll()
    .then((data: any) => {
      console.log('Vendors data', data);
      res.status(200).send(data);
    })
    .catch((err: unknown) => {
      console.error('OH NOOOOO', err);
    });
});

// KEEP AT BOTTOM OF GET REQUESTS
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(dist, 'index.html'));
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

function findUser(crushers: any) {
  throw new Error('Function not implemented.');
}
