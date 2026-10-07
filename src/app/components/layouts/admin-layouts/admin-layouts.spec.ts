import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLayouts } from './admin-layouts';

describe('AdminLayouts', () => {
  let component: AdminLayouts;
  let fixture: ComponentFixture<AdminLayouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayouts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLayouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
