import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Resolution, RESOLUTIONS } from '../_core/resolution';
import { ThumbnailsMakerService } from '../_core/services/thumbnails-maker.service';

@Component({
  selector: 'app-thumbnails-maker',
  templateUrl: './thumbnails-maker.component.html',
  styleUrls: ['./thumbnails-maker.component.scss']
})
export class ThumbnailsMakerComponent implements OnInit {

  image_url: any;
  success = false;
  resolutions_data: Resolution[] = RESOLUTIONS;
  thumbnails_data: any[] = [];

  form: FormGroup = this.formBuilder.group({ image: this.formBuilder.control(null, Validators.required),
                                             resolutions: this.formBuilder.array([], [Validators.required]),
                                            });

  get image() { return this.form.get('image'); }
  get resolutions() { return this.form.get('resolutions'); }
  
  constructor(private formBuilder: FormBuilder,
              private thumbMakerService: ThumbnailsMakerService,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }


  onChangeImg(event: any): void {
    let img = event.target.files[0];
		if (img.type.match(/image\/*/) == null) {
      this.form.patchValue({image: null})
			return;
		}

    var reader = new FileReader();
		reader.readAsDataURL(img);
		reader.onload = (_event) => this.image_url = reader.result;
    this.form.patchValue({image: img})
  }

  onToggleResolution(resol: Resolution): void {
    resol.is_target = !resol.is_target;
    const resolutionsArray: FormArray = this.form.get('resolutions') as FormArray;
    resolutionsArray.clear();
    this.resolutions_data.filter(r => r.is_target)
                         .forEach(r => resolutionsArray.push(new FormControl(r.width)));
  }


  make_thumbnails(): void {
    this.thumbMakerService.make_thumbnails(this.form.value).subscribe(status => this.success = status);
  }


  show_thumbnails(): void {
    let img_name = this.form.value.image.name;
    let target_resolutions = this.form.value.resolutions;
    
    for(let resol of target_resolutions) {
      this.thumbMakerService.get_thumbnail(img_name, resol).subscribe({ next: (resp: Blob) => { let thumb_url = window.URL.createObjectURL(resp);
                                                                                                let safe_url = this.sanitizer.bypassSecurityTrustResourceUrl(thumb_url);
                                                                                                this.thumbnails_data.push([safe_url, resol]);
                                                                                              },
                                                                        error: (err: any) => console.log(err)
                                                                      });
    }
  }


  reset(): void {
    this.form.reset();
  }


}
