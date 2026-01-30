import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { NbThemeModule, NbLayoutModule, NbSidebarModule, NbMenuModule, 
         NbCardModule, NbIconModule, NbButtonModule, NbToastrModule,
         NbDialogModule, NbWindowModule, NbActionsModule, NbUserModule,
         NbContextMenuModule, NbSearchModule, NbTooltipModule, NbBadgeModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    
    // Nebular Theme
    NbThemeModule.forRoot({ name: 'corporate' }),
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbToastrModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbEvaIconsModule,
    
    // Nebular UI Components
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbContextMenuModule,
    NbSearchModule,
    NbTooltipModule,
    NbBadgeModule,
    
    CoreModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
