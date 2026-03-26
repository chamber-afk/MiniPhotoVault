package com.miniphotovault

import android.media.ExifInterface
import com.facebook.react.bridge.*

class ExifModule(reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ExifModule"
    }

    @ReactMethod
    fun getExif(path: String, promise: Promise) {
        try {

            android.util.Log.d("EXIF", "PATH = $path")

            val exif = ExifInterface(path)

            var model =
                exif.getAttribute(ExifInterface.TAG_MODEL)

            var date =
                exif.getAttribute(ExifInterface.TAG_DATETIME)

            var lat =
                exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE)

            var lon =
                exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE)

            // fallback values

            if (model == null) {
                model = android.os.Build.MODEL
            }

            if (date == null) {
                date = java.text.SimpleDateFormat(
                    "yyyy-MM-dd HH:mm:ss"
                ).format(java.util.Date())
            }

            if (lat == null) {
                lat = "null"
            }

            if (lon == null) {
                lon = "null"
            }
            
            val map = Arguments.createMap()

            map.putString("model", model)
            map.putString("date", date)
            map.putString("lat", lat)
            map.putString("lon", lon)

            promise.resolve(map)

        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }
}