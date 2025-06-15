import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

const app = new Hono();

app.use("/api/v1/blog/*",async    (c,next)=>{
  const header=c.req.header("Authorization")||"";

  //@ts-ignore
  const user=await verify(header,c.env.JWT_SECRET)
  if(user.id){
    next();
  }else{
    c.status(403);
    return c.json({
      error:"Unauthorized"
    })
  }
})

app.post("/api/v1/user/signup", async (c) => {
  const prisma = new PrismaClient({
    //@ts-ignore
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    const token = await sign(
      {
        id: user.id,
      },
      //@ts-ignore
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

app.post("/api/v1/user/signin", async (c) => {
  const prisma = new PrismaClient({
    //@ts-ignore
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
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
    //@ts-ignore
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

app.post("/api/v1/blog", (c) => {
  return c.text("Post page for blog");
});
app.put("/api/v1/blog", (c) => {
  return c.text("update Page");
});
app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param("id");
  //console.log(id);
  return c.text("get by id");
});

app.get("/api/v1/blog/bulk", (c) => {
  return c.text("get by Bulk");
});

export default app;
