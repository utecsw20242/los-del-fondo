from views import create_item

if __name__ == '__main__':
    item = create_item("Sample Item", "This is a sample item.")
    print(f'Item created: {item.name} - {item.description}')