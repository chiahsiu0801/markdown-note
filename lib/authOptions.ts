import { Account, NextAuthOptions, User as UserAuth } from "next-auth";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "./utilsDb";
import { User } from "./models";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { ObjectId } from "mongoose";

import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";

interface AdapterUser extends BaseAdapterUser {
  username: string;
}

interface JWTAuth extends JWT {
  id: ObjectId;
  name: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          connectToDb();

          const user = await User.findOne({ email: credentials?.email });

          if(!user) {
            throw new Error('Email or Password is incorrect!');
          }

          const passwordCorrect = await bcrypt.compare(credentials?.password!, user.password);

          if(!passwordCorrect) {
            throw new Error('Email or Password is incorrect!'); 
          }
          
          return {
            id: user._id,
            username: user.username,
            email: user.email,
            password: user.password,
            img: user.img,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ account, token, user }: { account: (Account|null), token: JWT, user: (UserAuth|AdapterUser)}) {
      if(user && account && account.provider !== 'github' && account.provider !== 'google') {
        const userAuth = user as AdapterUser;
        return {
          ...token,
          id: userAuth.id,
          name: userAuth.username,
        }
      }
      
      return token;
    },
    async session({ session, token, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id ? token.id : token.sub,
        }
      }

      return session;
    }
  }
}
