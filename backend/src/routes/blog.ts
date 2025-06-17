import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {  verify } from "hono/jwt";
import { CreateBlogInput, UpdateBlogInput } from "@satyaprakash01/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const header = c.req.header("authorization") || "";
  try {
    const user = (await verify(header, c.env.JWT_SECRET)) as { id: string };
    if (user) {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({
        error: "Unauthorized",
      });
    }
  } catch (error) {
    c.status(403);
    console.log(error);
    return c.json({
      error: "Error whili authorizing",
    });
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const {success}=CreateBlogInput.safeParse(body);
    if(!success){
      c.status(411)
      return c.json({
        message :"Inputs are not correct"
      })
    }
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(userId),
      },
    });
    return c.json({
      id: blog.id,
      message: "New Blog created successfully",
    });
  } catch (error) {
    c.status(412);
    console.log(error);
    return c.json({
      message: "Error while creating a new blog",
    });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const {success}=UpdateBlogInput.safeParse(body);
    if(!success){
      c.status(411)
      return c.json({
        message :"Inputs are not correct"
      })
    }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({
      id: blog.id,
      message: " Blog updated successfully",
    });
  } catch (error) {
    c.status(412);
    console.log(error);
    return c.json({
      message: "Error while updating the blog",
    });
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blogs = await prisma.blog.findMany({
      select:{
        content:true,
        title:true,
        id:true,
        author:{
          select:{
            name:true
          }
        }
      }
    });
    return c.json({
      blogs,
      message: " Blogs are  fetched successfully",
    });
  } catch (error) {
    c.status(404);
    console.log(error);
    return c.json({
      message: "Error while fetching all the blogs",
    });
  }
});

blogRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: id,
      },
    });
    return c.json({
      blog,
      message: " Blog fetched successfully",
    });
  } catch (error) {
    c.status(404);
    console.log(error);
    return c.json({
      message: "Error while fetching the blog",
    });
  }
});
