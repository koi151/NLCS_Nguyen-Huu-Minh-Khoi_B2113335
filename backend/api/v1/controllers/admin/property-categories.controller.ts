import { Request, Response } from "express"

import PropertyCategory from "../../models/propertyCategories.model";
import { isValidStatus } from "../../../../helpers/dataTypeCheck";
import { PropertyCategoryType, TreeNode } from "../../../../commonTypes";
import { searchHelper } from "../../../../helpers/search";
import Category from "../../models/propertyCategories.model";
import { paginationHelper } from "../../../../helpers/pagination";
import { Document } from "mongoose";
import { createTreeHelper } from "../../../../helpers/createTree";
import { processCategoryData } from "../../../../helpers/processData";

const processImagesData = (imageUrls: string[] | string | undefined): string[] => {
  return imageUrls ? (Array.isArray(imageUrls) ? imageUrls : [imageUrls]) : [];
};

// [GET] /admin/property-categories
export const index = async (req: Request, res: Response) => {
  try {
    if (!res.locals.currentUser.permissions.includes('property-categories_view')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    interface Find {
      deleted?: boolean | null,
      listingType?: string | null
      status?: string | null,
      title?: RegExp | null,
      slug?: RegExp | null
    }
    
    let status: string | undefined = req.query.status?.toString();

    const find: Find = {
      deleted: false,
      ...(status && { status }),
    };

    // Searching
    const searchObject = searchHelper(req.query);
    const { regex, slugRegex } = searchObject;

    if (regex) {
      const orClause = { $or: [{ title: regex }, { slug: slugRegex }] };
      Object.assign(find, orClause);
    }    

    // Pagination
    const countRecords = await Category.countDocuments(find);
    let paginationObject = paginationHelper(
      {
        currentPage: typeof(req.query.currentPage) == "string" ? parseInt(req.query.currentPage) : 1,
        limitItems: 4,
        skip: null, // helper return skip, totalPage value, do not change
        totalPage: null,
      },
      req.query,
      countRecords
    );

    // Sorting 
    interface SortingQuery {
      [key: string]: 'asc' | 'desc';
    } 
    
    const sortingQuery: SortingQuery = {};
    
    if (req.query.sortKey && req.query.sortValue) {
      sortingQuery[req.query.sortKey.toString()] = req.query.sortValue.toString() as 'asc' | 'desc';
    }

    const categories = await Category.find(find)
      .sort(sortingQuery || '')
      .limit(paginationObject.limitItems || 0)
      .skip(paginationObject.skip || 0);

    const categoryCount = await Category.countDocuments(find);

    if (categories.length > 0) {
      res.status(200).json({
        code: 200,
        message: 'Success',
        categories: categories,
        paginationObject: paginationObject,
        categoryCount: categoryCount,
        permissions: {
          propertyCategoriesView: res.locals.currentUser.permissions.includes('property-categories_view'),
          propertyCategoriesEdit: res.locals.currentUser.permissions.includes('property-categories_edit'),
          propertyCategoriesCreate: res.locals.currentUser.permissions.includes('property-categories_create'),
          propertyCategoriesDelete: res.locals.currentUser.permissions.includes('property-categories_delete')
        }
      });

    } else {
      res.status(404).json({
        code: 404,
        message: 'No category found',
      });
    }

  } catch (error) {
    console.log('Error occurred while fetching categories data:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}

// [GET] /admin/property-categories/detail/:categoryId
export const detail = async (req: Request, res: Response) => {
  try {
    if (!res.locals.currentUser.permissions.includes('property-categories_view')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const id: string | undefined = req.params.categoryId;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid category ID'
      });
    }
  
    const category = await PropertyCategory.findOne(
      { _id: id }, 
      { deleted: false }
    )

    if (category) {
      res.status(200).json({
        code: 200,
        message: "Success",
        category: category
      })
    } else {
      res.status(400).json({
        code: 400,
        message: "Property category not found"
      })
    }

  } catch (error) {
    console.log('Error occurred while fetching properties data:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}

// [GET] /admin/property-categories/parent
export const parentCategory = async (req: Request, res: Response) => {
  try {
    if (!res.locals.currentUser.permissions.includes('property-categories_view')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const id: string | undefined = req.params.parentId;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid parent category ID'
      });
    }
  
    const parentCategory = await PropertyCategory.findOne(
      { _id: id }, 
      { deleted: false }
    ).select('title')

    if (parentCategory) {
      res.status(200).json({
        code: 200,
        message: "Success",
        parentCategory: parentCategory.title
      })
    } else {
      res.status(400).json({
        code: 400,
        message: "Parent category not found"
      })
    }

  } catch (error) {
    console.log('Error occurred while fetching properties data:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}

// [GET] /admin/property-categories/category-tree
export const categoryTree = async (req: Request, res: Response) => {
  try {
    console.log('Exes')

    if (!res.locals.currentUser.permissions.includes('property-categories_view')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const categories: Document<PropertyCategoryType>[] = await PropertyCategory.find(
      { deleted: false },
      'id title parent_id'
    );

    //convert to TreeNode type:
    const categoryTree: TreeNode[] = createTreeHelper(categories.map(doc => doc.toObject()));
    
    if (categoryTree) {
      res.status(200).json({
        code: 200,
        message: 'Get existed categories successfully',
        categoryTree: categoryTree,
      });
    } else {
      res.status(404).json({
        code: 404,
        message: 'Create category tree failed',
      });
    }

  } catch (error) {
    console.log('Error occurred while fetching properties data:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}

// [PATCH] /admin/property-categories/change-status/:status/:id
export const changeStatus = async (req: Request, res: Response) => {
  try {
    if (!res.locals.currentUser.permissions.includes('property-categories_edit')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const status = req.params.status;

    if (!isValidStatus(status)) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid status value',
      });
    }

    await PropertyCategory.updateOne(
      { _id: req.params.propertyId.toString() }, 
      { 
        deleted: false,
        status: req.params.status
      }
    )

    res.status(200).json({
      code: 200,
      message: "Property category status updated successfully"
    })

  } catch (error) {
    console.log('Error occurred while multing changing property:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
} 

// [PATCH] /admin/property-categories/edit/:propertyId
export const editPatch = async (req: Request, res: Response) => {
  try { 
    if (!res.locals.currentUser.permissions.includes('property-categories_edit')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const id: string | undefined = req.params.categoryId;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid category ID'
      });
    }
    const categoryUpdated: PropertyCategoryType = processCategoryData(req);

    // const processedImages = processImagesData(req.body.images);
    // const imagesToRemove = processImagesData(req.body.images_remove)

    // console.log("imagesToRemove:", imagesToRemove)

    await PropertyCategory.updateOne(
      { _id: id },
      { $set: categoryUpdated }
    );
    
    // Remove specified images
    // await PropertyCategory.findOneAndUpdate(
    //   { _id: id },
    //   { $pull: { images: { $in: imagesToRemove }}} // Remove specified images
    // );
    
    res.status(200).json({
      code: 200,
      message: 'Property updated successfully'
    })

  } catch (error) {
    console.log('Error occurred while editing property:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}

// [POST] /admin/property-categories/create
export const createPost = async (req: Request, res: Response) => {
  try {    
    if (!res.locals.currentUser.permissions.includes('property-categories_create')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const category: PropertyCategoryType = processCategoryData(req);

    if (!category.position) {
      const cntCategory = await Category.countDocuments();
      category.position = cntCategory + 1;
    }

    const newCategory = new Category(category);
    await newCategory.save();
    
    res.status(200).json({
      code: 200,
      message: "Created new property category successfully"
    })

  } catch (error) {
    console.log('Error occurred while creating property category:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}

// [DELETE] /admin/property-categories/delete/:propertyId
export const singleDelete = async (req: Request, res: Response) => {
  try {
    if (!res.locals.currentUser.permissions.includes('property-categories_delete')) {
      return res.json({
        code: 403,
        message: "Account does not have access rights"
      })
    }

    const id: string | undefined = req.params.categoryId;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: 'Invalid category ID'
      });
    }

    const result = await PropertyCategory.updateOne(
      { _id: id },
      { deleted: true }
    )

    if (result.matchedCount) {
      res.status(200).json({
        code: 200,
        message: "Property category deleted successfully"
      });
    } else {
      res.status(404).json({
        code: 404,
        message: "Property category not found"
      });
    }

  } catch (error) {
    console.log('Error occurred while deleting category:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error'
    });
  }
}