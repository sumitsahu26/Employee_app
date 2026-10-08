import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment.development';

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
  status?: 'Active' | 'Inactive';
}

interface MenuCategory {
  _id?: string;

  name: string;
  hindi: string;

  sortOrder?: number;
  status?: 'Active' | 'Inactive';

  items: MenuItem[];
}

interface ApiMenuItem {
  _id?: string;
  categoryId: string;

  name: string;
  hindi: string;

  price?: number | null;
  half?: number | null;
  full?: number | null;

  note?: string | null;

  sortOrder?: number;
  status?: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-menu',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './menu.html',

  styleUrl: './menu.css'
})
export class Menu implements OnInit, AfterViewInit, OnDestroy {

  // =====================================================
  // API URL
  // =====================================================

  categoryApiUrl = `${environment.apiUrl}/menuCategories`;

  itemApiUrl = `${environment.apiUrl}/menuItems`;


  // =====================================================
  // MENU DATA
  // =====================================================

  categories: MenuCategory[] = [];

  selectedCategory = 'STARTERS';

  searchText = '';


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = false;

  errorMessage = '';


  // =====================================================
  // INTERSECTION OBSERVER
  // =====================================================

  private observer!: IntersectionObserver;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.getMenuData();

  }


  // =====================================================
  // GET MENU DATA
  // =====================================================

  getMenuData(): void {

    this.isLoading = true;

    this.errorMessage = '';


    // Get Categories
    this.http.get<MenuCategory[]>(this.categoryApiUrl)
      .subscribe({

        next: (categories) => {

          console.log('Categories:', categories);

          // Get Items
          this.http.get<ApiMenuItem[]>(this.itemApiUrl)
            .subscribe({

              next: (items) => {

                console.log('Menu Items:', items);

                this.buildMenu(categories, items);

                this.isLoading = false;

                // Reinitialize observer after API data
                setTimeout(() => {

                  this.setupCategoryObserver();

                }, 300);

              },

              error: (error) => {

                console.error(
                  'Get menu items error:',
                  error
                );

                this.errorMessage =
                  'Unable to load menu items.';

                this.isLoading = false;

              }

            });

        },

        error: (error) => {

          console.error(
            'Get menu categories error:',
            error
          );

          this.errorMessage =
            'Unable to load menu categories.';

          this.isLoading = false;

        }

      });

  }


  // =====================================================
  // BUILD MENU
  // =====================================================

  buildMenu(
    categories: MenuCategory[],
    items: ApiMenuItem[]
  ): void {

    // Only active categories
    const activeCategories =
      categories.filter(
        category =>
          !category.status ||
          category.status === 'Active'
      );


    // Sort categories
    activeCategories.sort(
      (a, b) =>
        (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0)
    );


    this.categories =
      activeCategories.map(category => {

        const categoryItems =
          items

            .filter(item => {

              return (
                item.categoryId === category._id &&
                (!item.status ||
                  item.status === 'Active')
              );

            })

            .sort(
              (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0)
            );


        return {

          ...category,

          items: categoryItems

        };

      });


    // Set first category
    if (this.categories.length > 0) {

      const exists =
        this.categories.some(
          category =>
            category.name ===
            this.selectedCategory
        );


      if (!exists) {

        this.selectedCategory =
          this.categories[0].name;

      }

    }

  }


  // =====================================================
  // SEARCH
  // =====================================================

  get filteredCategories(): MenuCategory[] {

    if (!this.searchText.trim()) {

      return this.categories;

    }


    const search =
      this.searchText
        .toLowerCase()
        .trim();


    return this.categories

      .map(category => ({

        ...category,

        items: category.items.filter(item => {

          return (

            item.name
              .toLowerCase()
              .includes(search)

            ||

            item.hindi
              .includes(this.searchText.trim())

          );

        })

      }))

      .filter(category =>
        category.items.length > 0
      );

  }


  // =====================================================
  // HALF / FULL PRICE CHECK
  // =====================================================

  hasHalfFullPrices(
    category: MenuCategory
  ): boolean {

    return category.items.some(
      item =>
        item.half !== null &&
        item.half !== undefined ||

        item.full !== null &&
        item.full !== undefined
    );

  }


  // =====================================================
  // CATEGORY CLICK
  // =====================================================

  selectCategory(category: string): void {

    this.selectedCategory = category;


    setTimeout(() => {

      const element =
        document.getElementById(
          'category-' + category
        );


      if (element) {

        element.scrollIntoView({

          behavior: 'smooth',

          block: 'start'

        });

      }

    }, 50);

  }


  // =====================================================
  // INTERSECTION OBSERVER
  // =====================================================

  ngAfterViewInit(): void {

    // Don't call observer here because
    // API data may not be loaded yet.

  }


  setupCategoryObserver(): void {

    // Disconnect previous observer
    if (this.observer) {

      this.observer.disconnect();

    }


    this.observer =
      new IntersectionObserver(

        entries => {

          const visibleSections =
            entries

              .filter(
                entry =>
                  entry.isIntersecting
              )

              .sort(
                (a, b) =>
                  a.boundingClientRect.top -
                  b.boundingClientRect.top
              );


          if (
            visibleSections.length > 0
          ) {

            const id =
              visibleSections[0]
                .target
                .id;


            const category =
              id.replace(
                'category-',
                ''
              );


            this.selectedCategory =
              category;

          }

        },

        {

          root: null,

          threshold: 0.15,

          rootMargin:
            '-120px 0px -50% 0px'

        }

      );


    setTimeout(() => {

      document
        .querySelectorAll(
          '[id^="category-"]'
        )

        .forEach(section => {

          this.observer.observe(
            section
          );

        });

    }, 100);

  }


  // =====================================================
  // REFRESH MENU
  // =====================================================

  refreshMenu(): void {

    this.getMenuData();

  }


  // =====================================================
  // CLEANUP
  // =====================================================

  ngOnDestroy(): void {

    if (this.observer) {

      this.observer.disconnect();

    }

  }

}