class Earthquake {
  final String id;
  final String place;
  final double magnitude;
  final int time;
  
  Earthquake({
    required this.id,
    required this.place,
    required this.magnitude,
    required this.time,
  });
  
  factory Earthquake.fromJson(Map<String, dynamic> json) {
    final props = json['properties'];
    return Earthquake(
      id: json['id'],
      place: props['place'],
      magnitude: (props['mag'] as num?)?.toDouble() ?? 0.0,
      time: props['time'],
    );
  }
}
