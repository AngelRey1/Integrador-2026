import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenadorDashboardComponent } from './entrenador-dashboard.component';

describe('EntrenadorDashboardComponent', () => {
  let component: EntrenadorDashboardComponent;
  let fixture: ComponentFixture<EntrenadorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntrenadorDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrenadorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
