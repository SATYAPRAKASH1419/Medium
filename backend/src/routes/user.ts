import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign} from "hono/jwt";
import { SignInInput,SignUpInput } from "@satyaprakash01/medium-common";

export const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string
  }
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({

    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const {success}=SignUpInput.safeParse(body);
  if(!success){
    c.status(411)
    return c.json({
      message :"Inputs are not correct"
    })
  }
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name:body.name
      },
    });
    const token = await sign(
      {
        id: user.id,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      jwt: token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    c.status(403);
    return c.json({ error: "Error while signing Up" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  const {success}=SignInInput.safeParse(body);
  if(!success){
    c.status(411)
    return c.json({
      message :"Inputs are not correct"
    })
  }
  try {
    const user=await prisma.user.findUnique({
      where:{
        email:body.email
      }
    })

  if(!user){
    c.status(403);
    return c.json({
      message:"User not found"
    })
  }
  const token =await sign({id:user.id},
    c.env.JWT_SECRET)

    return c.json({
      jwt:token
    })

  } catch (error) {
    console.log(error)
     c.status(403);
    return c.json({
      error:"Error while signing up"
    })
  }
});