import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'earthquake.dart';
import 'earthquake_repository.dart';
import 'earthquake_state.dart';

class EarthquakeBloc extends Cubit<EarthquakeState> {
  final EarthquakeRepository repository;
  StreamSubscription<List<Earthquake>>? _subscription;
  EarthquakeBloc(this.repository) : super(EarthquakeInitial()) {
    _startStream();
  }
  void _startStream() {
    emit(EarthquakeLoading());
    _subscription = repository.getEarthquakeStream().listen(
      (data) => emit(EarthquakeLoaded(data, DateTime.now())),
      onError: (error) => emit(EarthquakeError(error.toString())),
    );
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
