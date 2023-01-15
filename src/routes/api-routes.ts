import  express, { Router, Request, Response, NextFunction } from 'express';
import { ApiControllers } from '../controllers/api-controllers';

const apiControllers = new ApiControllers;

export class ApiRouter {
  router: Router;
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/getUserInfo',apiControllers.getUserInfo);
    this.router.get('/getNewNonce',apiControllers.getNewNonce);
    this.router.post('/verifySignature',apiControllers.verifySignature);
  }
}