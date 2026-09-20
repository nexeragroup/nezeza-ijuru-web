import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Alert } from './components/alert/alert';
import { Badge } from './components/badge/badge';
import { Input } from './components/input/input';
import { Loader } from './components/loader/loader';
import { AlertContainer } from './components/alert/alert-container';
import { Button } from './components/button/button';

const COMPONENTS = [Badge, Button, Loader, Alert, AlertContainer, Input];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ...COMPONENTS],
})
export class SharedModule {}
