from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from typing import Optional, List, Dict, Any, TypeVar, Generic, Type
from django.db.models import QuerySet

T = TypeVar('T', bound=models.Model)


class BaseRepository(Generic[T]):
    """
    Base repository with common CRUD operations.
    This is Pure Fabrication - a pattern that doesn't exist in the real world
    but is created to achieve Low Coupling and High Cohesion.
    """
    
    def __init__(self, model_class: Type[T]):
        self.model_class = model_class
    
    def get_all(self, **filters) -> QuerySet[T]:
        """Get all records with optional filters"""
        queryset = self.model_class.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return queryset
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Get a record by ID"""
        try:
            return self.model_class.objects.get(id=id)
        except ObjectDoesNotExist:
            return None
    
    def get_by_field(self, field: str, value: Any) -> Optional[T]:
        """Get a record by any field"""
        try:
            kwargs = {field: value}
            return self.model_class.objects.get(**kwargs)
        except ObjectDoesNotExist:
            return None
    
    def create(self, **kwargs) -> T:
        """Create a new record"""
        return self.model_class.objects.create(**kwargs)
    
    def update(self, instance: T, **kwargs) -> T:
        """Update an existing record"""
        for key, value in kwargs.items():
            setattr(instance, key, value)
        instance.save()
        return instance
    
    def delete(self, instance: T, user=None) -> None:
        """Soft delete a record"""
        if hasattr(instance, 'delete'):
            instance.delete(user=user)
        else:
            instance.delete()
    
    def restore(self, instance: T) -> None:
        """Restore a soft-deleted record"""
        if hasattr(instance, 'restore'):
            instance.restore()
    
    def filter(self, **kwargs) -> QuerySet[T]:
        """Filter records"""
        return self.model_class.objects.filter(**kwargs)
    
    def exists(self, **kwargs) -> bool:
        """Check if records exist"""
        return self.model_class.objects.filter(**kwargs).exists()
    
    def count(self, **kwargs) -> int:
        """Count records"""
        return self.model_class.objects.filter(**kwargs).count()
    
    def get_or_create(self, defaults: Dict = None, **kwargs) -> tuple[T, bool]:
        """Get or create a record"""
        return self.model_class.objects.get_or_create(defaults=defaults, **kwargs)
    
    def bulk_create(self, objs: List[Dict]) -> List[T]:
        """Bulk create records"""
        instances = [self.model_class(**obj) for obj in objs]
        return self.model_class.objects.bulk_create(instances)
    
    def bulk_update(self, instances: List[T], fields: List[str]) -> int:
        """Bulk update records"""
        return self.model_class.objects.bulk_update(instances, fields)
