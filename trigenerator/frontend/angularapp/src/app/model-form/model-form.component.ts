import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-model-form',
  templateUrl: './model-form.component.html',
  styleUrls: ['./model-form.component.css']
})
export class ModelFormComponent {
  selectedCollection: string = '';
  collectionOptions: string[] = ['List', 'Dictionary', 'HashSet', 'LinkedList'];
  modelSuggestions: string[] = [];

  selectedModel: string = '';
  generatedDescription: string = '';
  generatedSolution: string = '';
  generatedTestCases: string = '';
  showDescription = true;
  showSolution = true;
  showTestCases = true;
  

  loading: boolean = false;

  constructor(private apiService: ApiService) {}

  getSuggestions() {
    if (!this.selectedCollection) return;

    this.loading = true;

    this.apiService.getModelSuggestions(this.selectedCollection).subscribe({
      next: (res) => {
        this.modelSuggestions = res.suggestions;
        this.selectedModel = '';
        this.generatedDescription = '';
        this.generatedSolution = '';
        this.generatedTestCases = '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

 
selectModel(suggestion: string) {
  this.selectedModel = suggestion;
  this.generatedDescription = '';
  this.generatedSolution = '';
  this.generatedTestCases = '';
  this.showDescription = true;
  this.showSolution = true;
  this.showTestCases = true;
}

  getDescription() {
    if (!this.selectedModel) return;

    this.loading = true;

    this.apiService.generateDescription(this.selectedModel, this.selectedCollection).subscribe({
      next: (res) => {
        this.generatedDescription = res.description;
        this.generatedSolution = '';
        this.generatedTestCases = '';
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getSolution() {
    if (!this.generatedDescription) return;

    this.loading = true;

    this.apiService.generateSolution(this.selectedModel, this.selectedCollection, this.generatedDescription).subscribe({
      next: (res) => {
        this.generatedSolution = res.solution;
        this.generatedTestCases = '';
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getTestCases() {
    if (!this.generatedSolution) return;

    this.loading = true;

    this.apiService.generateTestCases(this.generatedSolution, this.selectedCollection).subscribe({
      next: (res) => {
        this.generatedTestCases = res.testCases;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }


toggleDescription() {
  this.showDescription = !this.showDescription;
}

toggleSolution() {
  this.showSolution = !this.showSolution;
}

toggleTestCases() {
  this.showTestCases = !this.showTestCases;
}

}


