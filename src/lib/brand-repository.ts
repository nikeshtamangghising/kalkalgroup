import 'server-only'
import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { eq, ilike, and } from 'drizzle-orm'
import type { Brand } from '@/types'



export type CreateBrandInput = {
    name: string
    slug: string
    description?: string
    logoUrl?: string
    website?: string
    isActive?: boolean
}

export type UpdateBrandInput = Partial<CreateBrandInput>

export class BrandRepository {


    async findAll(includeInactive: boolean = false, search?: string): Promise<Brand[]> {
        // db is required - will throw error if DATABASE_URL is not set
        
        try {
            let whereConditions = [];
            
            if (!includeInactive) {
                whereConditions.push(eq(brands.isActive, true));
            }
            
            if (search) {
                whereConditions.push(
                    ilike(brands.name, `%${search}%`)
                );
            }
            
            const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
            
            const result = await db
                .select()
                .from(brands)
                .where(whereClause)
                .orderBy(brands.name);
            
            return result.map(brand => ({
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                logoUrl: brand.logoUrl,
                website: brand.website,
                isActive: brand.isActive,
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt
            }));
        } catch (error) {
            console.error('Error finding brands:', error);
            throw new Error('Failed to fetch brands');
        }
    }

    async findById(id: string): Promise<Brand | null> {
        // db is required - will throw error if DATABASE_URL is not set
        
        try {
            const result = await db
                .select()
                .from(brands)
                .where(eq(brands.id, id))
                .limit(1);
            
            if (result.length === 0) {
                return null;
            }
            
            const brand = result[0];
            return {
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                logoUrl: brand.logoUrl,
                website: brand.website,
                isActive: brand.isActive,
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt
            };
        } catch (error) {
            console.error('Error finding brand by id:', error);
            throw new Error('Failed to fetch brand');
        }
    }

    async findBySlug(slug: string): Promise<Brand | null> {
        // db is required - will throw error if DATABASE_URL is not set
        
        try {
            const result = await db
                .select()
                .from(brands)
                .where(eq(brands.slug, slug))
                .limit(1);
            
            if (result.length === 0) {
                return null;
            }
            
            const brand = result[0];
            return {
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                logoUrl: brand.logoUrl,
                website: brand.website,
                isActive: brand.isActive,
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt
            };
        } catch (error) {
            console.error('Error finding brand by slug:', error);
            throw new Error('Failed to fetch brand');
        }
    }

    async create(data: CreateBrandInput): Promise<Brand> {
        // db is required - will throw error if DATABASE_URL is not set
        
        try {
            const newBrand = {
                name: data.name,
                slug: data.slug,
                description: data.description,
                logoUrl: data.logoUrl,
                website: data.website,
                isActive: data.isActive ?? true,
            };

            const result = await db
                .insert(brands)
                .values(newBrand)
                .returning();

            const createdBrand = result[0];
            return {
                id: createdBrand.id,
                name: createdBrand.name,
                slug: createdBrand.slug,
                description: createdBrand.description,
                logoUrl: createdBrand.logoUrl,
                website: createdBrand.website,
                isActive: createdBrand.isActive,
                createdAt: createdBrand.createdAt,
                updatedAt: createdBrand.updatedAt
            };
        } catch (error) {
            console.error('Error creating brand:', error);
            throw new Error('Failed to create brand');
        }
    }

    async update(id: string, data: UpdateBrandInput): Promise<Brand> {
        // db is required - will throw error if DATABASE_URL is not set
        
        try {
            const updateData: any = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.slug !== undefined) updateData.slug = data.slug;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
            if (data.website !== undefined) updateData.website = data.website;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;
            
            updateData.updatedAt = new Date();

            const result = await db
                .update(brands)
                .set(updateData)
                .where(eq(brands.id, id))
                .returning();

            if (result.length === 0) {
                throw new Error('Brand not found');
            }

            const updatedBrand = result[0];
            return {
                id: updatedBrand.id,
                name: updatedBrand.name,
                slug: updatedBrand.slug,
                description: updatedBrand.description,
                logoUrl: updatedBrand.logoUrl,
                website: updatedBrand.website,
                isActive: updatedBrand.isActive,
                createdAt: updatedBrand.createdAt,
                updatedAt: updatedBrand.updatedAt
            };
        } catch (error) {
            console.error('Error updating brand:', error);
            throw new Error('Failed to update brand');
        }
    }

    async delete(id: string): Promise<void> {
        // db is required - will throw error if DATABASE_URL is not set
        
        try {
            await db
                .delete(brands)
                .where(eq(brands.id, id));
        } catch (error) {
            console.error('Error deleting brand:', error);
            throw new Error('Failed to delete brand');
        }
    }
}

export const brandRepository = new BrandRepository()
export const getBrandRepository = () => brandRepository
