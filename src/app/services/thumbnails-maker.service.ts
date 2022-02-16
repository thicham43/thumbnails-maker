import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailsMakerService {

  api_url: string = "http://localhost:8000/api";

  constructor(private http: HttpClient) { }

  make_thumbnails(img: File | any, resolutions: number[]): Observable<boolean> {
    const formData = new FormData(); 
    formData.append("image", img, img.name);
    formData.append("resolutions", `${resolutions}`);
    return this.http.post<boolean>(`${this.api_url}/make_thumbnails`, formData);
  }

  get_thumbnail(img_name: string, thumb_resolution: number): Observable<Blob> {
    return this.http.get(`${this.api_url}/get_thumbnail/${thumb_resolution}/${img_name}`, {responseType: 'blob'});
  }
}
