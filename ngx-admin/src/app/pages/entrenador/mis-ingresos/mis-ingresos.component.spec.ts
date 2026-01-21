import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisIngresosComponent } from './mis-ingresos.component';

describe('MisIngresosComponent', () => {
  let component: MisIngresosComponent;
  let fixture: ComponentFixture<MisIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MisIngresosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
