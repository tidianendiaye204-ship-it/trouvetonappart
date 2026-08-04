import { z } from 'zod'

export const typeBienSchema = z.enum(['terrain', 'maison', 'appartement'])
export const transactionSchema = z.enum(['location', 'vente'])
export const statutBienSchema = z.enum(['disponible', 'reserve', 'loue', 'vendu'])

export const bienSchema = z.object({
  titre: z.string().min(5, { message: "Le titre doit faire au moins 5 caractères." }),
  type: typeBienSchema,
  transaction: transactionSchema,
  prix: z.coerce.number().positive({ message: "Le prix doit être positif." }),
  superficie: z.coerce.number().positive({ message: "La superficie doit être positive." }).nullable().optional(),
  nb_chambres: z.coerce.number().nonnegative({ message: "Le nombre de chambres ne peut être négatif." }).nullable().optional(),
  quartier: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  publie: z.boolean().default(false),
  statut: statutBienSchema.default('disponible'),
  description: z.string().nullable().optional(),
  telephone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
})

export type BienFormData = z.infer<typeof bienSchema>
