import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicLayouts } from './public-layouts';

describe('PublicLayouts', () => {
  let component: PublicLayouts;
  let fixture: ComponentFixture<PublicLayouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLayouts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicLayouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
