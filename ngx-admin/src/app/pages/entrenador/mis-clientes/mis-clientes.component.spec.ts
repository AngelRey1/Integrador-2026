import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisClientesComponent } from './mis-clientes.component';

describe('MisClientesComponent', () => {
  let component: MisClientesComponent;
  let fixture: ComponentFixture<MisClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MisClientesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
