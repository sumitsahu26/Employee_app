import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment.development';


// ============================================================
// INTERFACES
// ============================================================

interface MenuCategory {
  _id?: string;
  name: string;
  hindi: string;
  sortOrder?: number;
  status: 'Active' | 'Inactive';
}

interface MenuItem {
  _id?: string;
  categoryId: string;
  name: string;
  hindi: string;
  price?: number | null;
  half?: number | null;
  full?: number | null;
  note?: string | null;
  sortOrder?: number;
  status: 'Active' | 'Inactive';
}


// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuItems implements OnInit, OnDestroy {

  categoryApiUrl = `${environment.apiUrl}/menuCategories`;
  itemApiUrl = `${environment.apiUrl}/menuItems`;


  categoryList: MenuCategory[] = [];
  itemList: MenuItem[] = [];

  selectedCategory: MenuCategory | null = null;


  categorySearch = '';
  itemSearch = '';

  isLoadingCategories = false;
  isLoadingItems = false;

  isSavingCategory = false;
  isSavingItem = false;

  isDeletingCategory = false;
  isDeletingItem = false;

  showModal = false;

  formType: 'category' | 'item' = 'category';

  editCategoryId: string | null = null;

  categoryName = '';
  categoryHindi = '';
  categoryStatus: 'Active' | 'Inactive' = 'Active';

  editItemId: string | null = null;

  itemName = '';
  itemHindi = '';

  itemPrice: number | null = null;
  itemHalf: number | null = null;
  itemFull: number | null = null;

  itemNote = '';

  itemStatus: 'Active' | 'Inactive' = 'Active';


  // ==========================================================
  // ERROR
  // ==========================================================

  errorMessage = '';


  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================================
  // ON INIT
  // ==========================================================

  ngOnInit(): void {

    this.getMenuData();

  }


  // ==========================================================
  // GET COMPLETE MENU DATA
  // ==========================================================

  getMenuData(): void {

    this.isLoadingCategories = true;
    this.isLoadingItems = true;

    this.errorMessage = '';

    forkJoin({

      categories: this.http
        .get<MenuCategory[]>(this.categoryApiUrl)
        .pipe(
          catchError(error => {

            console.error(
              'Category API Error:',
              error
            );

            this.errorMessage =
              'Unable to load menu categories.';

            return of([]);
          })
        ),

      items: this.http
        .get<MenuItem[]>(this.itemApiUrl)
        .pipe(
          catchError(error => {

            console.error(
              'Menu Item API Error:',
              error
            );

            this.errorMessage =
              'Unable to load menu items.';

            return of([]);
          })
        )

    }).subscribe({

      next: (result) => {

        this.categoryList = result.categories || [];

        this.itemList = result.items || [];


        // Sort categories
        this.categoryList.sort(
          (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
        );


        // Sort items
        this.itemList.sort(
          (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
        );


        this.isLoadingCategories = false;
        this.isLoadingItems = false;


        // Select first category
        if (
          this.categoryList.length > 0 &&
          !this.selectedCategory
        ) {

          this.selectCategory(
            this.categoryList[0]
          );

        }
        else if (
          this.selectedCategory
        ) {

          const category = this.categoryList.find(
            item =>
              item._id ===
              this.selectedCategory?._id
          );

          if (category) {

            this.selectedCategory =
              category;

          }
          else {

            this.selectedCategory =
              this.categoryList[0] || null;

          }

        }

      },

      error: (error) => {

        console.error(
          'Menu API Error:',
          error
        );

        this.isLoadingCategories = false;
        this.isLoadingItems = false;

        this.errorMessage =
          'Something went wrong while loading menu.';

      }

    });

  }


  // ==========================================================
  // FILTERED CATEGORIES
  // ==========================================================

  get filteredCategories(): MenuCategory[] {

    const search =
      this.categorySearch
        .trim()
        .toLowerCase();

    if (!search) {

      return this.categoryList;

    }

    return this.categoryList.filter(
      category =>
        category.name
          ?.toLowerCase()
          .includes(search)
        ||
        category.hindi
          ?.toLowerCase()
          .includes(search)
    );

  }


  // ==========================================================
  // SELECTED CATEGORY ITEMS
  // ==========================================================

  get selectedCategoryItems(): MenuItem[] {

    if (!this.selectedCategory?._id) {

      return [];

    }

    return this.itemList.filter(
      item =>
        item.categoryId ===
        this.selectedCategory?._id
    );

  }


  // ==========================================================
  // FILTERED ITEMS
  // ==========================================================

  get filteredItems(): MenuItem[] {

    let items =
      this.selectedCategoryItems;

    const search =
      this.itemSearch
        .trim()
        .toLowerCase();

    if (!search) {

      return items;

    }

    return items.filter(
      item =>
        item.name
          ?.toLowerCase()
          .includes(search)
        ||
        item.hindi
          ?.toLowerCase()
          .includes(search)
        ||
        item.note
          ?.toLowerCase()
          .includes(search)
    );

  }


  // ==========================================================
  // SELECT CATEGORY
  // ==========================================================

  selectCategory(
    category: MenuCategory
  ): void {

    this.selectedCategory =
      category;

    // Clear item search
    this.itemSearch = '';

  }


  // ==========================================================
  // GET ITEM COUNT
  // ==========================================================

  getItemCount(
    categoryId?: string
  ): number {

    if (!categoryId) {

      return 0;

    }

    return this.itemList.filter(
      item =>
        item.categoryId === categoryId
    ).length;

  }


  // ==========================================================
  // ADD CATEGORY
  // ==========================================================

  onAddCategory(): void {

    this.formType = 'category';

    this.editCategoryId = null;

    this.categoryName = '';
    this.categoryHindi = '';

    this.categoryStatus =
      'Active';

    this.errorMessage = '';

    this.showModal = true;

  }


  // ==========================================================
  // EDIT CATEGORY
  // ==========================================================

  onEditCategory(
    category: MenuCategory
  ): void {

    this.formType = 'category';

    this.editCategoryId =
      category._id || null;

    this.categoryName =
      category.name;

    this.categoryHindi =
      category.hindi;

    this.categoryStatus =
      category.status || 'Active';

    this.errorMessage = '';

    this.showModal = true;

  }


  // ==========================================================
  // SAVE CATEGORY
  // ==========================================================

  saveCategory(): void {

    // Trim name
    this.categoryName =
      this.categoryName.trim();

    this.categoryHindi =
      this.categoryHindi.trim();


    // Validation

    if (!this.categoryName) {

      this.errorMessage =
        'Please enter category name.';

      return;

    }


    // Prevent duplicate category

    const duplicate =
      this.categoryList.some(
        category =>
          category.name
            .trim()
            .toLowerCase() ===
            this.categoryName
              .trim()
              .toLowerCase()
          &&
          category._id !==
            this.editCategoryId
      );


    if (duplicate) {

      this.errorMessage =
        'Category already exists.';

      return;

    }


    this.isSavingCategory = true;
    this.errorMessage = '';


    // ========================================================
    // EDIT
    // ========================================================

    if (this.editCategoryId) {

      const payload: MenuCategory = {

        name:
          this.categoryName,

        hindi:
          this.categoryHindi,

        status:
          this.categoryStatus,

        sortOrder:
          this.getCategorySortOrder()

      };


      this.http
        .put(
          `${this.categoryApiUrl}/${this.editCategoryId}`,
          payload
        )
        .subscribe({

          next: () => {

            this.isSavingCategory = false;

            this.showModal = false;

            this.getMenuData();

          },

          error: (error) => {

            console.error(
              'Update category error:',
              error
            );

            this.isSavingCategory = false;

            this.errorMessage =
              'Unable to update category.';

          }

        });

    }

    // ========================================================
    // ADD
    // ========================================================

    else {

      const payload: MenuCategory = {

        name:
          this.categoryName,

        hindi:
          this.categoryHindi,

        status:
          this.categoryStatus,

        sortOrder:
          this.categoryList.length + 1

      };


      this.http
        .post<MenuCategory>(
          this.categoryApiUrl,
          payload
        )
        .subscribe({

          next: () => {

            this.isSavingCategory = false;

            this.showModal = false;

            this.getMenuData();

          },

          error: (error) => {

            console.error(
              'Add category error:',
              error
            );

            this.isSavingCategory = false;

            this.errorMessage =
              'Unable to add category.';

          }

        });

    }

  }


  // ==========================================================
  // CATEGORY SORT ORDER
  // ==========================================================

  getCategorySortOrder(): number {

    const category =
      this.categoryList.find(
        item =>
          item._id ===
          this.editCategoryId
      );

    return category?.sortOrder ??
      this.categoryList.length + 1;

  }


  // ==========================================================
  // DELETE CATEGORY
  // ==========================================================

  onDeleteCategory(
    categoryId?: string
  ): void {

    if (!categoryId) {

      return;

    }


    const itemCount =
      this.getItemCount(categoryId);


    if (itemCount > 0) {

      alert(
        'This category contains menu items. Please delete or move the items first.'
      );

      return;

    }


    const confirmDelete =
      confirm(
        'Are you sure you want to delete this category?'
      );


    if (!confirmDelete) {

      return;

    }


    this.isDeletingCategory = true;


    this.http
      .delete(
        `${this.categoryApiUrl}/${categoryId}`
      )
      .subscribe({

        next: () => {

          this.isDeletingCategory = false;

          // If deleted category was selected
          if (
            this.selectedCategory?._id ===
            categoryId
          ) {

            this.selectedCategory = null;

          }

          this.getMenuData();

        },

        error: (error) => {

          console.error(
            'Delete category error:',
            error
          );

          this.isDeletingCategory = false;

          alert(
            'Unable to delete category.'
          );

        }

      });

  }


  // ==========================================================
  // ADD MENU ITEM
  // ==========================================================

  onAddItem(): void {

    if (!this.selectedCategory?._id) {

      alert(
        'Please select a category first.'
      );

      return;

    }


    this.formType = 'item';

    this.editItemId = null;

    this.itemName = '';
    this.itemHindi = '';

    this.itemPrice = null;
    this.itemHalf = null;
    this.itemFull = null;

    this.itemNote = '';

    this.itemStatus =
      'Active';

    this.errorMessage = '';

    this.showModal = true;

  }


  // ==========================================================
  // EDIT MENU ITEM
  // ==========================================================

  onEditItem(
    item: MenuItem
  ): void {

    this.formType = 'item';

    this.editItemId =
      item._id || null;

    this.itemName =
      item.name;

    this.itemHindi =
      item.hindi;

    this.itemPrice =
      item.price ?? null;

    this.itemHalf =
      item.half ?? null;

    this.itemFull =
      item.full ?? null;

    this.itemNote =
      item.note ?? '';

    this.itemStatus =
      item.status || 'Active';

    this.errorMessage = '';

    this.showModal = true;

  }


  // ==========================================================
  // SAVE MENU ITEM
  // ==========================================================

  saveItem(): void {

    // Trim values

    this.itemName =
      this.itemName.trim();

    this.itemHindi =
      this.itemHindi.trim();

    this.itemNote =
      this.itemNote.trim();


    // Validation

    if (!this.itemName) {

      this.errorMessage =
        'Please enter menu item name.';

      return;

    }


    if (!this.selectedCategory?._id) {

      this.errorMessage =
        'Please select category.';

      return;

    }


    // Duplicate item

    const duplicate =
      this.itemList.some(
        item =>
          item.categoryId ===
            this.selectedCategory?._id
          &&
          item.name
            .trim()
            .toLowerCase() ===
            this.itemName
              .trim()
              .toLowerCase()
          &&
          item._id !==
            this.editItemId
      );


    if (duplicate) {

      this.errorMessage =
        'This menu item already exists in this category.';

      return;

    }


    this.isSavingItem = true;
    this.errorMessage = '';


    // ========================================================
    // EDIT ITEM
    // ========================================================

    if (this.editItemId) {

      const existingItem =
        this.itemList.find(
          item =>
            item._id ===
            this.editItemId
        );


      const payload: MenuItem = {

        categoryId:
          existingItem?.categoryId ??
          this.selectedCategory._id,

        name:
          this.itemName,

        hindi:
          this.itemHindi,

        price:
          this.itemPrice,

        half:
          this.itemHalf,

        full:
          this.itemFull,

        note:
          this.itemNote || null,

        status:
          this.itemStatus,

        sortOrder:
          existingItem?.sortOrder ??
          this.selectedCategoryItems.length + 1

      };


      this.http
        .put(
          `${this.itemApiUrl}/${this.editItemId}`,
          payload
        )
        .subscribe({

          next: () => {

            this.isSavingItem = false;

            this.showModal = false;

            this.getMenuData();

          },

          error: (error) => {

            console.error(
              'Update menu item error:',
              error
            );

            this.isSavingItem = false;

            this.errorMessage =
              'Unable to update menu item.';

          }

        });

    }

    // ========================================================
    // ADD ITEM
    // ========================================================

    else {

      const payload: MenuItem = {

        categoryId:
          this.selectedCategory._id,

        name:
          this.itemName,

        hindi:
          this.itemHindi,

        price:
          this.itemPrice,

        half:
          this.itemHalf,

        full:
          this.itemFull,

        note:
          this.itemNote || null,

        status:
          this.itemStatus,

        sortOrder:
          this.selectedCategoryItems.length + 1

      };


      this.http
        .post<MenuItem>(
          this.itemApiUrl,
          payload
        )
        .subscribe({

          next: () => {

            this.isSavingItem = false;

            this.showModal = false;

            this.getMenuData();

          },

          error: (error) => {

            console.error(
              'Add menu item error:',
              error
            );

            this.isSavingItem = false;

            this.errorMessage =
              'Unable to add menu item.';

          }

        });

    }

  }


  // ==========================================================
  // DELETE MENU ITEM
  // ==========================================================

  onDeleteItem(
    itemId?: string
  ): void {

    if (!itemId) {

      return;

    }


    const confirmDelete =
      confirm(
        'Are you sure you want to delete this menu item?'
      );


    if (!confirmDelete) {

      return;

    }


    this.isDeletingItem = true;


    this.http
      .delete(
        `${this.itemApiUrl}/${itemId}`
      )
      .subscribe({

        next: () => {

          this.isDeletingItem = false;

          this.getMenuData();

        },

        error: (error) => {

          console.error(
            'Delete menu item error:',
            error
          );

          this.isDeletingItem = false;

          alert(
            'Unable to delete menu item.'
          );

        }

      });

  }


  // ==========================================================
  // CANCEL
  // ==========================================================

  onCancel(): void {

    this.showModal = false;

    this.resetForm();

  }


  // ==========================================================
  // RESET FORM
  // ==========================================================

  resetForm(): void {

    this.editCategoryId = null;

    this.editItemId = null;

    this.categoryName = '';
    this.categoryHindi = '';
    this.categoryStatus = 'Active';

    this.itemName = '';
    this.itemHindi = '';

    this.itemPrice = null;
    this.itemHalf = null;
    this.itemFull = null;

    this.itemNote = '';

    this.itemStatus = 'Active';

    this.errorMessage = '';

  }


  // ==========================================================
  // REFRESH
  // ==========================================================

  refreshMenu(): void {

    this.getMenuData();

  }


  // ==========================================================
  // DESTROY
  // ==========================================================

  ngOnDestroy(): void {

    // Nothing required currently

  }

}