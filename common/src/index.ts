import z from "zod"
export const SignUpInput=z.object({
    email:z.string().email(),
    password:z.string().min(6),
    name:z.string().optional()
})
export const SignInInput=z.object({
    email:z.string().email(),
    password:z.string().min(6),
    name:z.string().optional()
})
export const CreateBlogInput=z.object({
   title:z.string(),
   content:z.string()
})
export const UpdateBlogInput=z.object({
   title:z.string(),
   content:z.string(),
   id:z.number()
})


export  type SignUpInput=z.infer<typeof SignUpInput>
export  type SignInInput=z.infer<typeof SignInInput>
export  type CreateBlogInput=z.infer<typeof CreateBlogInput>
export  type UpdateBlogInput=z.infer<typeof UpdateBlogInput>