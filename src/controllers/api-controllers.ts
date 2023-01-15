import { Request, Response, NextFunction } from 'express';
import {User} from "../model/User";
import {ResponseMessage} from "../model/ResponseMessage";
import { bufferToHex } from 'ethereumjs-util';
import { recoverPersonalSignature } from 'eth-sig-util';

declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}

export class ApiControllers {
  getUserInfo(request: Request, response: Response, next: NextFunction) {

    if(!request.session.user){
      let user:User=new User();
      // user.nonce=Math.floor(Math.random() * 1000000).toString();
      request.session.user=user;
    }

    let resp:ResponseMessage=new ResponseMessage();
    resp.code=200;
    resp.message=request.session.user;

    response.type('application/json');
    response.send(resp);
  }
  getNewNonce(request: Request, response: Response, next: NextFunction){
    if(!request.session.user){
      request.session.user=new User();
    }
    const nonce:string=Math.floor(Math.random() * 1000000).toString();
    request.session.user.nonce=nonce;

    let resp:ResponseMessage=new ResponseMessage();
    resp.code=200;
    resp.message=nonce;

    response.type('application/json');
    response.send(resp);
  }
  verifySignature(request: Request, response: Response, next: NextFunction) {

    let verification:boolean=false;

    const address:string=request.body.address;
    const signature:string =request.body.signature;
    const nonce=`I am signing my one-time nonce: ${request.session.user!.nonce}`;
    console.log('address=',address,'signature=',signature,'nonce=',nonce)

    //verify
    const nonceBufferHex = bufferToHex(Buffer.from(nonce, 'utf8'));
    const verifyAddress = recoverPersonalSignature({
      data: nonceBufferHex,
      sig: signature,
    });

    if(address.toLowerCase()==verifyAddress.toLowerCase()){
      verification=true;
      request.session.user!.address=address;
    }

    let resp:ResponseMessage=new ResponseMessage();
    resp.code=200;
    resp.message=verification;

    response.type('application/json');
    response.send(resp);
  }
}