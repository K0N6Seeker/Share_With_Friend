import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:collection/collection.dart';
import 'earthquake.dart';

class EarthquakeRepository {
  final String endpoint =
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
  List<String> _lastIds = [];

  Stream<List<Earthquake>> getEarthquakeStream({Duration interval = const Duration(seconds: 30)}) async* {
    while (true) {
      try {
        await Future.delayed(interval);
        final response = await http.get(Uri.parse(endpoint));
        
        if (response.statusCode == 200) {
          final jsonData = jsonDecode(response.body);
          final List features = jsonData['features'];

          // Filter earthquakes only with the magnitudes greater than 2.0
          final List<Earthquake> quakes = [];
          for (final f in features) {
            if (f['properties']['mag'] > 2.0) {
              quakes.add(Earthquake.fromJson(f));
            }
          }

          // Emit earthquakes only when there is a change
          final currentIds = quakes.map((q) => q.id).toList();
          if (!const ListEquality().equals(currentIds, _lastIds)) {
            _lastIds = currentIds;
            yield quakes; // Emit only if changed
          }
        }
      } catch (_) {
        // Optionally yield [] or ignore
      }
    }
  }
}
