import 'earthquake.dart';
import 'package:equatable/equatable.dart';

abstract class EarthquakeState extends Equatable {
  @override
  List<Object?> get props => [];
}

class EarthquakeInitial extends EarthquakeState {}

class EarthquakeLoading extends EarthquakeState {}

class EarthquakeLoaded extends EarthquakeState {
  final List<Earthquake> earthquakes;
  final DateTime lastUpdated;
  EarthquakeLoaded(this.earthquakes, this.lastUpdated);
  @override
  List<Object?> get props => [earthquakes, lastUpdated];
}

class EarthquakeError extends EarthquakeState {
  final String message;
  EarthquakeError(this.message);
  @override
  List<Object?> get props => [message];
}
