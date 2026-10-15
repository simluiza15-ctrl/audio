import './styles/main.scss';
import { mount } from 'redom';
import { App } from './components/App';

const app = document.getElementById('app');

if (!app) {
    throw new Error('Корневой элемент #app не найден');
}

const application = new App();

mount(app, application);
